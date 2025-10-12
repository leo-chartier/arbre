export async function onRequest(context) {
  try {
    const { results } = await context.env.DB.prepare(
      "SELECT * FROM unions"
    )
    .run();

    return new Response(JSON.stringify(results.map(converter)), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(error.toString());
  }
}

function converter(row) {
  return {
    parent1: row.parent1,
    parent2: row.parent2 ?? null,
    children: row.children ?? "",
    dom: convertDate(row.domy, row.domm, row.domd),
    pom: row.pom ?? null,
    dod: convertDate(row.dody, row.dodm, row.dodd),
  }
}

function convertDate(y, m, d) {
  return [y, m, d].filter(v => v).join('/');
}
