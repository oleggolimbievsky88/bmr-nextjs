import { NextResponse } from 'next/server'
import { getDealerFlatRateForTier } from '@/lib/queries'

const DEFAULT_DEALER_FLAT_RATE = 14.95

/**
 * GET: Return current dealer flat rate shipping for Tier 1 (lower 48).
 * Value comes from dealer_tiers table; falls back to default if table empty.
 * Used by checkout/shipping when dealer tier 1 or 2 qualifies for flat rate.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const tier = searchParams.get('tier') != null
      ? parseInt(searchParams.get('tier'), 10)
      : 1
    const value = await getDealerFlatRateForTier(Number.isFinite(tier) ? tier : 1)
    const valueNum =
      Number.isFinite(value) && value > 0 ? value : DEFAULT_DEALER_FLAT_RATE
    return NextResponse.json({
      value: valueNum,
      currency: 'USD',
      description: 'Dealer flat rate shipping (lower 48 US)',
      source: 'dealer_tiers',
    })
  } catch (err) {
    console.error('Dealer flat rate GET error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
