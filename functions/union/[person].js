export async function onRequest(context) {
  try {
    const { results } = await context.env.DB.prepare(
      `SELECT * FROM unions WHERE parent1 = ? OR parent2 = ? OR children = ? OR children LIKE "?,%" OR children LIKE "%,?" OR children LIKE "%,?,%"`.replace("?", context.params.person)
    )
    .all();

    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(error.toString());
  }
}
