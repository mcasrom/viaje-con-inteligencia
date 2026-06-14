export async function GET() {
  return Response.json({
    ok: true,
    service: "supabase-test",
    status: "working",
    timestamp: new Date().toISOString()
  });
}
