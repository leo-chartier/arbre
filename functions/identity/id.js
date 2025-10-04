export async function onRequest(context) {
  try {
    const { results } = await context.env.DB.prepare(
      `SELECT * FROM identities WHERE id = ${context.params.id}`
    ).run();

    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(error.toString());
  }
}
