export async function onRequest(context) {
  return new Response(`SELECT * FROM identities WHERE id = ${context.params.id}`);

  const { results } = await env.DB.prepare(
    `SELECT * FROM identities WHERE id = ${context.params.id}`
  ).run();

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' }
  });
}
