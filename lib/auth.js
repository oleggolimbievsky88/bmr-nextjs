// lib/auth.js - Authentication utilities

import bcrypt from 'bcryptjs'
import pool from './db'
import crypto from 'crypto'

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password) {
	return bcrypt.hash(password, 12)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password, hashedPassword) {
	return bcrypt.compare(password, hashedPassword)
}

/**
 * Generate a secure random token
 */
export function generateToken(length = 32) {
	return crypto.randomBytes(length).toString('hex')
}

/**
 * Get user by email
 */
export async function getUserByEmail(email) {
	try {
		const [rows] = await pool.query(
			'SELECT * FROM customers WHERE email = ? LIMIT 1',
			[email]
		)
		return rows[0] || null
	} catch (error) {
		console.error('Error getting user by email:', error)
		return null
	}
}

/**
 * Get user by ID
 */
export async function getUserById(customerId) {
	try {
		const [rows] = await pool.query(
			'SELECT CustomerID, firstname, lastname, email, emailVerified, role, dealerTier, dealerDiscount, image, createdAt FROM customers WHERE CustomerID = ? LIMIT 1',
			[customerId]
		)
		return rows[0] || null
	} catch (error) {
		console.error('Error getting user by ID:', error)
		return null
	}
}

/**
 * Create a new user
 */
export async function createUser(userData) {
	const {
		email,
		password,
		firstname,
		lastname,
		role = 'customer',
		dealerTier = 0,
		dealerDiscount = 0,
	} = userData

	try {
		const hashedPassword = await hashPassword(password)
		const [result] = await pool.query(
			`INSERT INTO customers 
			(email, password, firstname, lastname, role, dealerTier, dealerDiscount, datecreated) 
			VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
			[email, hashedPassword, firstname, lastname, role, dealerTier, dealerDiscount]
		)
		return result.insertId
	} catch (error) {
		console.error('Error creating user:', error)
		throw error
	}
}

/**
 * Create email verification token
 */
export async function createVerificationToken(customerId, type = 'email_verification') {
	const token = generateToken()
	const expires = new Date()
	expires.setHours(expires.getHours() + 24) // 24 hours

	try {
		await pool.query(
			`INSERT INTO verification_tokens (customerId, token, type, expires) 
			VALUES (?, ?, ?, ?)`,
			[customerId, token, type, expires]
		)
		return token
	} catch (error) {
		console.error('Error creating verification token:', error)
		throw error
	}
}

/**
 * Get verification token
 */
export async function getVerificationToken(token) {
	try {
		const [rows] = await pool.query(
			'SELECT * FROM verification_tokens WHERE token = ? AND expires > NOW() LIMIT 1',
			[token]
		)
		return rows[0] || null
	} catch (error) {
		console.error('Error getting verification token:', error)
		return null
	}
}

/**
 * Delete verification token
 */
export async function deleteVerificationToken(token) {
	try {
		await pool.query('DELETE FROM verification_tokens WHERE token = ?', [token])
	} catch (error) {
		console.error('Error deleting verification token:', error)
	}
}

/**
 * Verify user email
 */
export async function verifyUserEmail(customerId) {
	try {
		await pool.query(
			'UPDATE customers SET emailVerified = NOW() WHERE CustomerID = ?',
			[customerId]
		)
		return true
	} catch (error) {
		console.error('Error verifying email:', error)
		return false
	}
}

/**
 * Create or update OAuth account
 */
export async function createOrUpdateOAuthAccount(accountData) {
	const {
		customerId,
		provider,
		providerAccountId,
		accessToken,
		refreshToken,
		expiresAt,
		tokenType,
		scope,
		idToken,
	} = accountData

	try {
		const [existing] = await pool.query(
			'SELECT id FROM accounts WHERE provider = ? AND providerAccountId = ? LIMIT 1',
			[provider, providerAccountId]
		)

		if (existing.length > 0) {
			// Update existing account
			await pool.query(
				`UPDATE accounts SET 
				customerId = ?, accessToken = ?, refreshToken = ?, expiresAt = ?, 
				tokenType = ?, scope = ?, idToken = ?, updatedAt = NOW()
				WHERE provider = ? AND providerAccountId = ?`,
				[
					customerId,
					accessToken,
					refreshToken,
					expiresAt,
					tokenType,
					scope,
					idToken,
					provider,
					providerAccountId,
				]
			)
			return existing[0].id
		} else {
			// Create new account
			const [result] = await pool.query(
				`INSERT INTO accounts 
				(customerId, provider, providerAccountId, accessToken, refreshToken, expiresAt, tokenType, scope, idToken)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				[
					customerId,
					provider,
					providerAccountId,
					accessToken,
					refreshToken,
					expiresAt,
					tokenType,
					scope,
					idToken,
				]
			)
			return result.insertId
		}
	} catch (error) {
		console.error('Error creating/updating OAuth account:', error)
		throw error
	}
}

/**
 * Get OAuth account by provider and provider account ID
 */
export async function getOAuthAccount(provider, providerAccountId) {
	try {
		const [rows] = await pool.query(
			`SELECT a.*, c.* FROM accounts a 
			JOIN customers c ON a.customerId = c.CustomerID 
			WHERE a.provider = ? AND a.providerAccountId = ? LIMIT 1`,
			[provider, providerAccountId]
		)
		return rows[0] || null
	} catch (error) {
		console.error('Error getting OAuth account:', error)
		return null
	}
}
