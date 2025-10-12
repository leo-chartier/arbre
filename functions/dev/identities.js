export async function onRequest(context) {
  try {
    const { results } = await context.env.DB.prepare(
      "SELECT * FROM identities"
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
    id: row.id,
    gender: row.gender ?? 0,
    lastname: row.lastname ?? "",
    firstnames: row.firstnames ?? "",
    dob: convertDate(row.doby, row.dobm, row.dobd),
    pob: row.pob ?? null,
    dod: convertDate(row.dody, row.dodm, row.dodd),
    pod: row.pod ?? null,
    picture: row.picture ?? null,
  }
}

function convertDate(y, m, d) {
  return [y, m, d].filter(v => v).join('/') || null;
}
