import { NextResponse } from 'next/server'
import { getDealerTiers, updateDealerTier } from '@/lib/queries'

/**
 * GET: Return all dealer tiers (discount_percent, flat_rate_shipping, etc.).
 */
export async function GET() {
  try {
    const tiers = await getDealerTiers()
    return NextResponse.json({ tiers })
  } catch (err) {
    console.error('Dealer tiers GET error:', err)
    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT: Update one or more dealer tiers.
 * Body: { updates: [ { id, name?, discount_percent?, flat_rate_shipping? }, ... ] }
 */
export async function PUT(request) {
  try {
    const body = await request.json()
    const updates = Array.isArray(body.updates) ? body.updates : [body]
    const results = []
    for (const u of updates) {
      const id = u.id != null ? parseInt(u.id, 10) : null
      if (!id || isNaN(id)) {
        results.push({ id: u.id, success: false, error: 'Invalid id' })
        continue
      }
      const ok = await updateDealerTier(id, {
        name: u.name,
        discount_percent: u.discount_percent,
        flat_rate_shipping: u.flat_rate_shipping,
      })
      results.push({ id, success: ok })
    }
    const tiers = await getDealerTiers()
    return NextResponse.json({ success: true, results, tiers })
  } catch (err) {
    console.error('Dealer tiers PUT error:', err)
    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: 500 }
    )
  }
}
