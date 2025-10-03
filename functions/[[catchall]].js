export async function onRequest(context) {
    try {
      return new Response(JSON.stringify(Object.keys(context.env)));
  const { results } = await context.env.arbre.prepare(
    `SELECT * FROM identities WHERE id = ${context.params.id}`
  ).run();

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' }
  });
  } catch (error) {
    return new Response(error.toString());
  }
}
