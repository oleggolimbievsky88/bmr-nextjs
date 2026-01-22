// app/api/auth/forgot-password/route.js
// Password reset request endpoint

import { NextResponse } from 'next/server'
import { getUserByEmail, createVerificationToken } from '@/lib/auth'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request) {
	try {
		const body = await request.json()
		const { email } = body

		if (!email) {
			return NextResponse.json({ error: 'Email is required' }, { status: 400 })
		}

		// Get user
		const user = await getUserByEmail(email)

		// Don't reveal if user exists or not (security best practice)
		if (user) {
			// Create password reset token
			const token = await createVerificationToken(user.CustomerID, 'password_reset')

			// Send password reset email
			await sendPasswordResetEmail(email, token, user.firstname || 'User')
		}

		// Always return success to prevent email enumeration
		return NextResponse.json({
			message:
				'If an account with that email exists, a password reset link has been sent.',
		})
	} catch (error) {
		console.error('Password reset error:', error)
		return NextResponse.json(
			{ error: 'An error occurred' },
			{ status: 500 }
		)
	}
}
