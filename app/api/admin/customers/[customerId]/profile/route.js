import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { hashPassword } from '@/lib/auth'
import {
	getCustomerProfileByIdAdmin,
	updateCustomerProfileAdmin,
} from '@/lib/queries'

const getCustomerIdFromParams = (params) => {
	const customerId = Number.parseInt(params?.customerId, 10)
	return Number.isNaN(customerId) ? null : customerId
}

export async function GET (request, { params }) {
	try {
		const session = await getServerSession(authOptions)

		if (!session || session.user?.role !== 'admin') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const customerId = getCustomerIdFromParams(params)
		if (!customerId) {
			return NextResponse.json(
				{ error: 'Invalid customer ID' },
				{ status: 400 }
			)
		}

		const customer = await getCustomerProfileByIdAdmin(customerId)

		if (!customer) {
			return NextResponse.json(
				{ error: 'Customer not found' },
				{ status: 404 }
			)
		}

		return NextResponse.json({ success: true, customer })
	} catch (error) {
		console.error('Error fetching customer profile:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch customer profile' },
			{ status: 500 }
		)
	}
}

export async function PUT (request, { params }) {
	try {
		const session = await getServerSession(authOptions)

		if (!session || session.user?.role !== 'admin') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const customerId = getCustomerIdFromParams(params)
		if (!customerId) {
			return NextResponse.json(
				{ error: 'Invalid customer ID' },
				{ status: 400 }
			)
		}

		const customer = await getCustomerProfileByIdAdmin(customerId)
		if (!customer) {
			return NextResponse.json(
				{ error: 'Customer not found' },
				{ status: 404 }
			)
		}

		const body = await request.json()
		const updateData = { ...body }

		if (updateData.password) {
			if (updateData.password.length < 8) {
				return NextResponse.json(
					{ error: 'Password must be at least 8 characters long' },
					{ status: 400 }
				)
			}
			updateData.passwordHash = await hashPassword(updateData.password)
		}

		delete updateData.password
		delete updateData.confirmPassword

		const result = await updateCustomerProfileAdmin(customerId, updateData)

		if (result?.reason === 'no-fields') {
			return NextResponse.json(
				{ error: 'No fields to update' },
				{ status: 400 }
			)
		}

		return NextResponse.json({
			success: true,
			message: 'Customer profile updated successfully',
		})
	} catch (error) {
		if (error?.code === 'EMAIL_EXISTS') {
			return NextResponse.json(
				{ error: error.message },
				{ status: 409 }
			)
		}

		console.error('Error updating customer profile:', error)
		return NextResponse.json(
			{ error: 'Failed to update customer profile' },
			{ status: 500 }
		)
	}
}
