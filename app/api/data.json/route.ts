
export async function GET() {
  const data = await import('../../../public_data.json');
  return new Response(JSON.stringify(data.default), {
    headers: { 'Content-Type': 'application/json' },
  });
}
