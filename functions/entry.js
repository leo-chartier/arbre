export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);

    return new Response(
      "it works"
    );

    if (pathname === "/api/identities") {
      const { results } = await env.arbre.prepare(
        "SELECT * FROM identities WHERE id = ?"
      ).run();
      return new Response(JSON.stringify(results), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (pathname === "/api/unions") {
      const { results } = await env.arbre.prepare(
        "SELECT * FROM unions WHERE id = ?"
      ).run();
      return new Response(JSON.stringify(results), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return env.ASSETS.fetch(request);
  },
};
