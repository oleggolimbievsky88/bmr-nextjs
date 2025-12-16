#!/usr/bin/env node

/**
 * MCP Server for Next.js E-commerce Application
 * Exposes application functionality to Chrome DevTools via Model Context Protocol
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import pool from './lib/db.js'
// Note: queries.js imports db without .js extension, so we'll implement needed functions directly
// import * as queries from './lib/queries.js'

const server = new Server(
	{
		name: 'ecomus-nextjs-mcp',
		version: '0.1.0',
	},
	{
		capabilities: {
			tools: {},
		},
	}
)

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
	return {
		tools: [
			{
				name: 'query_database',
				description: 'Execute a SQL query against the MySQL database',
				inputSchema: {
					type: 'object',
					properties: {
						sql: {
							type: 'string',
							description: 'The SQL query to execute',
						},
						params: {
							type: 'array',
							description: 'Optional parameters for prepared statements',
							items: {
								type: ['string', 'number', 'boolean', 'null'],
							},
						},
					},
					required: ['sql'],
				},
			},
			{
				name: 'get_product',
				description: 'Get product details by ID',
				inputSchema: {
					type: 'object',
					properties: {
						productId: {
							type: 'number',
							description: 'The product ID',
						},
					},
					required: ['productId'],
				},
			},
			{
				name: 'get_products_by_category',
				description: 'Get products filtered by category ID',
				inputSchema: {
					type: 'object',
					properties: {
						categoryId: {
							type: 'number',
							description: 'The category ID',
						},
						limit: {
							type: 'number',
							description: 'Maximum number of products to return',
							default: 50,
						},
					},
					required: ['categoryId'],
				},
			},
			{
				name: 'get_platform',
				description: 'Get platform (body) details by ID',
				inputSchema: {
					type: 'object',
					properties: {
						platformId: {
							type: 'number',
							description: 'The platform/body ID',
						},
					},
					required: ['platformId'],
				},
			},
			{
				name: 'get_menu_data',
				description: 'Get the full menu structure with platforms and categories',
				inputSchema: {
					type: 'object',
					properties: {},
				},
			},
			{
				name: 'search_products',
				description: 'Search products by part number or keyword',
				inputSchema: {
					type: 'object',
					properties: {
						query: {
							type: 'string',
							description: 'Search query (part number or keyword)',
						},
						limit: {
							type: 'number',
							description: 'Maximum number of results',
							default: 20,
						},
					},
					required: ['query'],
				},
			},
			{
				name: 'get_categories',
				description: 'Get all categories or categories by main category',
				inputSchema: {
					type: 'object',
					properties: {
						mainCatId: {
							type: 'number',
							description: 'Optional main category ID to filter by',
						},
					},
				},
			},
			{
				name: 'get_api_routes',
				description: 'List all available API routes in the Next.js application',
				inputSchema: {
					type: 'object',
					properties: {},
				},
			},
			{
				name: 'get_database_stats',
				description: 'Get database statistics (table counts, etc.)',
				inputSchema: {
					type: 'object',
					properties: {},
				},
			},
		],
	}
})

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
	const { name, arguments: args } = request.params

	try {
		switch (name) {
			case 'query_database': {
				const { sql, params = [] } = args
				const [rows] = await pool.query(sql, params)
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(rows, null, 2),
						},
					],
				}
			}

			case 'get_product': {
				const { productId } = args
				const [rows] = await pool.query(
					'SELECT * FROM products WHERE ProductID = ?',
					[productId]
				)
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(rows[0] || null, null, 2),
						},
					],
				}
			}

			case 'get_products_by_category': {
				const { categoryId, limit = 50 } = args
				const [rows] = await pool.query(
					`SELECT * FROM products
					 WHERE FIND_IN_SET(?, CatID) AND Display = 1 AND EndProduct != 1
					 LIMIT ?`,
					[categoryId, limit]
				)
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(rows, null, 2),
						},
					],
				}
			}

			case 'get_platform': {
				const { platformId } = args
				const [rows] = await pool.query(
					'SELECT * FROM bodies WHERE BodyID = ?',
					[platformId]
				)
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(rows[0] || null, null, 2),
						},
					],
				}
			}

			case 'get_menu_data': {
				// Implement menu data query directly since queries.js has import issues
				try {
					const query = `
						SELECT b.BodyID, b.Name, b.StartYear, b.EndYear, b.BodyOrder, b.slug,
						       bc.BodyCatID, bc.BodyCatName, bc.Position
						FROM bodies b
						JOIN bodycats bc ON b.BodyCatID = bc.BodyCatID
						ORDER BY bc.Position, b.BodyOrder
					`
					const [bodies] = await pool.query(query)

					// Group by categories
					const menuData = {
						fordLinks: bodies.filter(b => b.BodyCatName.includes('Ford')),
						gmLateModelLinks: bodies.filter(b => b.BodyCatName.includes('GM Late Model')),
						gmMidMuscleLinks: bodies.filter(b => b.BodyCatName.includes('GM Mid Muscle')),
						gmClassicMuscleLinks: bodies.filter(b => b.BodyCatName.includes('GM Classic Muscle')),
						moparLinks: bodies.filter(b => b.BodyCatName.includes('Mopar')),
					}

					return {
						content: [
							{
								type: 'text',
								text: JSON.stringify(menuData, null, 2),
							},
						],
					}
				} catch (error) {
					return {
						content: [
							{
								type: 'text',
								text: `Error fetching menu data: ${error.message}`,
							},
						],
						isError: true,
					}
				}
			}

			case 'search_products': {
				const { query, limit = 20 } = args
				const searchTerm = `%${query}%`
				const [rows] = await pool.query(
					`SELECT ProductID, PartNumber, ProductName, Price, ImageSmall, ImageLarge
					 FROM products
					 WHERE (PartNumber LIKE ? OR ProductName LIKE ? OR Description LIKE ?)
					   AND Display = 1 AND EndProduct != 1
					 LIMIT ?`,
					[searchTerm, searchTerm, searchTerm, limit]
				)
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(rows, null, 2),
						},
					],
				}
			}

			case 'get_categories': {
				const { mainCatId } = args
				let sql = 'SELECT * FROM categories'
				let params = []
				if (mainCatId) {
					sql += ' WHERE MainCatID = ?'
					params.push(mainCatId)
				}
				sql += ' ORDER BY CatName'
				const [rows] = await pool.query(sql, params)
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(rows, null, 2),
						},
					],
				}
			}

			case 'get_api_routes': {
				const routes = [
					'/api/products',
					'/api/products/[id]',
					'/api/products/featured',
					'/api/products/new-products',
					'/api/categories',
					'/api/categories/[catId]',
					'/api/platforms',
					'/api/platform/[id]',
					'/api/maincategories',
					'/api/maincategories/[mainCategoryId]',
					'/api/banner',
					'/api/colors',
					'/api/hardware',
					'/api/grease',
					'/api/anglefinder',
					'/api/manufacturers',
					'/api/vehicles',
					'/api/search/suggestions',
					'/api/validate-coupon',
					'/api/validate-address',
					'/api/ups-shipping-rates',
					'/api/orders',
					'/api/orders/[orderId]',
					'/api/menu',
				]
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(routes, null, 2),
						},
					],
				}
			}

			case 'get_database_stats': {
				const tables = [
					'products',
					'categories',
					'bodies',
					'maincategories',
					'customers',
					'orders',
					'invoice',
					'coupons',
				]
				const stats = {}
				for (const table of tables) {
					const [rows] = await pool.query(`SELECT COUNT(*) as count FROM ${table}`)
					stats[table] = rows[0].count
				}
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(stats, null, 2),
						},
					],
				}
			}

			default:
				throw new Error(`Unknown tool: ${name}`)
		}
	} catch (error) {
		return {
			content: [
				{
					type: 'text',
					text: `Error: ${error.message}`,
				},
			],
			isError: true,
		}
	}
})

// Start the server
async function main() {
	const transport = new StdioServerTransport()
	await server.connect(transport)
	console.error('Ecomus Next.js MCP server running on stdio')
}

main().catch((error) => {
	console.error('Fatal error in MCP server:', error)
	process.exit(1)
})

