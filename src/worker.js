/**
 * Cloudflare Worker:
 * - /auth/        → suunab GitHub OAuth lehele
 * - /auth/callback → vahetab koodi tokeni vastu, tagastab CMS-ile
 * - kõik muu      → staatiline sait (ASSETS binding)
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ── OAuth algus ──────────────────────────────────────
    if (url.pathname === '/auth/' || url.pathname === '/auth') {
      if (!env.GITHUB_CLIENT_ID) {
        return new Response('GITHUB_CLIENT_ID puudub Cloudflare seadetest.', { status: 500 });
      }
      const githubUrl =
        `https://github.com/login/oauth/authorize` +
        `?client_id=${env.GITHUB_CLIENT_ID}` +
        `&scope=repo,user` +
        `&state=${crypto.randomUUID()}`;
      return Response.redirect(githubUrl, 302);
    }

    // ── OAuth callback ───────────────────────────────────
    if (url.pathname === '/auth/callback') {
      const code = url.searchParams.get('code');
      if (!code) {
        return new Response('Puudub OAuth kood.', { status: 400 });
      }

      const tokenResp = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });

      const tokenData = await tokenResp.json();

      if (tokenData.error) {
        return new Response(`GitHub OAuth viga: ${tokenData.error_description}`, { status: 400 });
      }

      const token = tokenData.access_token;
      const msg = JSON.stringify({ token, provider: 'github' });

      // Tagastab lehe mis saadab tokeni CMS aknale
      const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Autoriseerimine...</title></head>
<body>
<p>Autoriseerimine õnnestus. Aken sulgub...</p>
<script>
  try {
    window.opener.postMessage(
      'authorization:github:success:${msg.replace(/'/g, "\\'")}',
      '*'
    );
  } catch(e) {}
  setTimeout(() => window.close(), 500);
</script>
</body></html>`;

      return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // ── Staatiline sait ──────────────────────────────────
    return env.ASSETS.fetch(request);
  },
};
