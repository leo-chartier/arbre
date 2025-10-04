export async function onRequest(context) {
  try {
    const { results } = await context.env.DB.prepare(
      "SELECT id FROM identities"
    )
    .run();

    return new Response(JSON.stringify(results.map(row => row.id)), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(error.toString());
  }
}
