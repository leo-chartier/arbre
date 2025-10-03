export async function onRequest(context) {
  const { results } = await env.DB.prepare(
    `SELECT * FROM identities WHERE id = ${context.params.id}`
  ).run();

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' }
  });
}
