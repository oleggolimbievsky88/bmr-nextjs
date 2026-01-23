 // app/api/auth/register/route.js
// User registration endpoint

import { NextResponse } from 'next/server'
import { createUser, getUserByEmail, createVerificationToken } from '@/lib/auth'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request) {
	try {
		const body = await request.json()
		const { email, password, firstname, lastname } = body

		// Validation
		if (!email || !password || !firstname || !lastname) {
			return NextResponse.json(
				{ error: 'All fields are required' },
				{ status: 400 }
			)
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(email)) {
			return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
		}

		// Validate password strength
		if (password.length < 8) {
			return NextResponse.json(
				{ error: 'Password must be at least 8 characters long' },
				{ status: 400 }
			)
		}

		// Check if user already exists
		const existingUser = await getUserByEmail(email)
		if (existingUser) {
			return NextResponse.json(
				{ error: 'An account with this email already exists' },
				{ status: 409 }
			)
		}

		// Create user
		const customerId = await createUser({
			email,
			password,
			firstname,
			lastname,
			role: 'customer',
		})

		// Create verification token
		const token = await createVerificationToken(customerId, 'email_verification')

		// Send verification email
		const emailResult = await sendVerificationEmail(
			email,
			token,
			firstname
		)

		if (!emailResult.success) {
			console.error('Failed to send verification email:', emailResult.error)
			const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
			const verifyUrl = `${baseUrl}/verify-email?token=${token}`
			console.error('---')
			console.error('Dev workaround: Copy this verification link into your browser:')
			console.error(verifyUrl)
			console.error('Fix SMTP (535 = bad credentials): .env.local SMTP_USER/SMTP_PASS, or try /api/test-email')
			console.error('---')
		}

		return NextResponse.json(
			{
				message: 'Account created successfully. Please check your email to verify your account.',
				customerId,
			},
			{ status: 201 }
		)
	} catch (error) {
		console.error('Registration error:', error)
		return NextResponse.json(
			{ error: 'An error occurred during registration' },
			{ status: 500 }
		)
	}
}
