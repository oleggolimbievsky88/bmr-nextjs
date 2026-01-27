/**
 * Encrypt / decrypt cc_payment_token for new_orders (charge-when-ship flow).
 * Uses AES-256-GCM. Key from CC_ENCRYPTION_KEY (64 hex chars = 32 bytes).
 *
 * - Encrypt before INSERT. Decrypt only server-side when charging (e.g. Authorize.net).
 * - Never send decrypted token to client. Use redactOrderCcToken() before API responses.
 */

import crypto from 'crypto'

const ALG = 'aes-256-gcm'
const IV_LEN = 12
const TAG_LEN = 16
const PREFIX = 'enc$'

function getKey() {
	const k = process.env.CC_ENCRYPTION_KEY
	if (!k || typeof k !== 'string') {
		throw new Error('CC_ENCRYPTION_KEY is required (64 hex chars). Generate: openssl rand -hex 32')
	}
	const buf = Buffer.from(k, 'hex')
	if (buf.length !== 32) {
		throw new Error('CC_ENCRYPTION_KEY must be 64 hex characters (32 bytes). Generate: openssl rand -hex 32')
	}
	return buf
}

/**
 * Encrypt plaintext. Returns null for null/empty. Throws if CC_ENCRYPTION_KEY missing/invalid.
 * @param {string|null|undefined} plaintext
 * @returns {string|null}
 */
export function encrypt(plaintext) {
	if (plaintext == null || plaintext === '') return null
	const key = getKey()
	const iv = crypto.randomBytes(IV_LEN)
	const cipher = crypto.createCipheriv(ALG, key, iv, { authTagLength: TAG_LEN })
	const ct = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()])
	const tag = cipher.getAuthTag()
	const parts = [iv, ct, tag].map((b) => b.toString('base64'))
	return PREFIX + parts.join(':')
}

/**
 * Decrypt a value produced by encrypt(). Use only server-side (e.g. charge API).
 * If value does not start with PREFIX, returns as-is (legacy plaintext). Never expose result to client.
 * @param {string|null|undefined} encrypted
 * @returns {string|null}
 */
export function decrypt(encrypted) {
	if (encrypted == null || encrypted === '') return null
	if (!String(encrypted).startsWith(PREFIX)) return String(encrypted)
	const key = getKey()
	const parts = String(encrypted).slice(PREFIX.length).split(':')
	if (parts.length !== 3) return String(encrypted)
	try {
		const [iv, ct, tag] = parts.map((p) => Buffer.from(p, 'base64'))
		const decipher = crypto.createDecipheriv(ALG, key, iv, { authTagLength: TAG_LEN })
		decipher.setAuthTag(tag)
		return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8')
	} catch {
		return null
	}
}

/**
 * Redact cc_payment_token before sending order to client. Mutates order.
 * - forAdmin: true  -> set to '[stored]' when present so UI can show "Card on file"
 * - forAdmin: false -> delete key so it is never sent to customers
 * @param {object} order
 * @param {{ forAdmin: boolean }} opts
 * @returns {object} order (same reference)
 */
export function redactOrderCcToken(order, { forAdmin }) {
	if (!order || typeof order !== 'object') return order
	if (forAdmin) {
		order.cc_payment_token = order.cc_payment_token ? '[stored]' : null
	} else {
		delete order.cc_payment_token
	}
	return order
}
