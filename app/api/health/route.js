export async function GET() {
    debugger;
    return new Response(JSON.stringify({ status: "ok" }), {
        headers: { "Content-Type": "application/json" }
    });
}
