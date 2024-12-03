import { getBodies } from "@/lib/queries";

export async function GET() {
  try {
    const bodies = await getBodies();
    return new Response(JSON.stringify(bodies), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}