export async function onRequest(context) {
  try {
    const request = `SELECT * FROM unions WHERE parent1 = ? OR parent2 = ? OR children = ? OR children LIKE "?,%" OR children LIKE "%,?" OR children LIKE "%,?,%"`.replace("?", context.params.person);
    const { results } = await context.env.DB.prepare(request).all();

    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(error.toString());
  }
}
