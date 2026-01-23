'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminPage() {
	const [stats, setStats] = useState({
		totalOrders: 0,
		pendingOrders: 0,
		processedOrders: 0,
		shippedOrders: 0,
		totalCoupons: 0,
		activeCoupons: 0,
	})
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetchStats()
	}, [])

	const fetchStats = async () => {
		try {
			const ordersResponse = await fetch('/api/admin/orders')
			const ordersData = await ordersResponse.json()
			const couponsResponse = await fetch('/api/admin/coupons')
			const couponsData = await couponsResponse.json()

			if (ordersResponse.ok && couponsResponse.ok) {
				const orders = ordersData.orders || []
				const coupons = couponsData.coupons || []
				setStats({
					totalOrders: orders.length,
					pendingOrders: orders.filter((o) => o.status === 'pending').length,
					processedOrders: orders.filter((o) => o.status === 'processed').length,
					shippedOrders: orders.filter((o) => o.status === 'shipped').length,
					totalCoupons: coupons.length,
					activeCoupons: coupons.filter(
						(c) => c.is_active === 1 || c.is_active === true
					).length,
				})
			}
		} catch (error) {
			console.error('Error fetching stats:', error)
		} finally {
			setLoading(false)
		}
	}

	if (loading) {
		return (
			<div className="text-center py-12">
				<div className="spinner-border" role="status">
					<span className="visually-hidden">Loading...</span>
				</div>
				<p className="mt-2">Loading dashboard...</p>
			</div>
		)
	}

	return (
		<div>
			<h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
				<div className="bg-white rounded-lg shadow p-6">
					<h3 className="text-lg font-semibold text-gray-600 mb-2">Total Orders</h3>
					<p className="text-3xl font-bold">{stats.totalOrders}</p>
					<Link href="/admin/orders" className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block">View all orders →</Link>
				</div>
				<div className="bg-white rounded-lg shadow p-6">
					<h3 className="text-lg font-semibold text-gray-600 mb-2">Pending Orders</h3>
					<p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p>
					<Link href="/admin/orders?status=pending" className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block">View pending →</Link>
				</div>
				<div className="bg-white rounded-lg shadow p-6">
					<h3 className="text-lg font-semibold text-gray-600 mb-2">Processed Orders</h3>
					<p className="text-3xl font-bold text-blue-600">{stats.processedOrders}</p>
					<Link href="/admin/orders?status=processed" className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block">View processed →</Link>
				</div>
				<div className="bg-white rounded-lg shadow p-6">
					<h3 className="text-lg font-semibold text-gray-600 mb-2">Shipped Orders</h3>
					<p className="text-3xl font-bold text-green-600">{stats.shippedOrders}</p>
					<Link href="/admin/orders?status=shipped" className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block">View shipped →</Link>
				</div>
				<div className="bg-white rounded-lg shadow p-6">
					<h3 className="text-lg font-semibold text-gray-600 mb-2">Total Coupons</h3>
					<p className="text-3xl font-bold">{stats.totalCoupons}</p>
					<Link href="/admin/coupons" className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block">Manage coupons →</Link>
				</div>
				<div className="bg-white rounded-lg shadow p-6">
					<h3 className="text-lg font-semibold text-gray-600 mb-2">Active Coupons</h3>
					<p className="text-3xl font-bold text-green-600">{stats.activeCoupons}</p>
					<Link href="/admin/coupons" className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block">Manage coupons →</Link>
				</div>
			</div>
			<div className="bg-white rounded-lg shadow p-6">
				<h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Link href="/admin/orders" className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 text-center">Manage Orders</Link>
					<Link href="/admin/coupons" className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 text-center">Manage Coupons</Link>
					<Link href="/admin/import" className="bg-gray-600 text-white px-6 py-3 rounded hover:bg-gray-700 text-center">Import ACES/PIES</Link>
				</div>
			</div>
		</div>
	)
}
