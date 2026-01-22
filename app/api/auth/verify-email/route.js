// app/api/auth/verify-email/route.js
// Email verification endpoint

import { NextResponse } from 'next/server'
import {
	getVerificationToken,
	deleteVerificationToken,
	verifyUserEmail,
} from '@/lib/auth'

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url)
		const token = searchParams.get('token')

		if (!token) {
			return NextResponse.json({ error: 'Token is required' }, { status: 400 })
		}

		// Get verification token
		const verificationToken = await getVerificationToken(token)

		if (!verificationToken) {
			return NextResponse.json(
				{ error: 'Invalid or expired verification token' },
				{ status: 400 }
			)
		}

		// Verify email
		const success = await verifyUserEmail(verificationToken.customerId)

		if (!success) {
			return NextResponse.json(
				{ error: 'Failed to verify email' },
				{ status: 500 }
			)
		}

		// Delete used token
		await deleteVerificationToken(token)

		return NextResponse.json({ message: 'Email verified successfully' })
	} catch (error) {
		console.error('Email verification error:', error)
		return NextResponse.json(
			{ error: 'An error occurred during verification' },
			{ status: 500 }
		)
	}
}
