import { NextResponse } from 'next/server'

const AUTH_COOKIES = [
	'next-auth.session-token',
	'__Secure-next-auth.session-token',
	'next-auth.csrf-token',
	'__Host-next-auth.csrf-token',
	'next-auth.callback-url',
]

const clearAuthCookies = (response) => {
	AUTH_COOKIES.forEach((name) => {
		const isSecure = name.startsWith('__Secure-') || name.startsWith('__Host-')
		response.cookies.set(name, '', {
			path: '/',
			maxAge: 0,
			secure: isSecure,
		})
	})
}

export async function POST () {
	const response = NextResponse.json({ success: true })
	clearAuthCookies(response)
	return response
}

export async function GET (request) {
	const { searchParams } = new URL(request.url)
	const callbackUrl = searchParams.get('callbackUrl') || '/'
	const redirectUrl = new URL(callbackUrl, request.url)
	const response = NextResponse.redirect(redirectUrl)
	clearAuthCookies(response)
	return response
}
