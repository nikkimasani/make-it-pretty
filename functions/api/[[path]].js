export async function onRequest(context) {
  const { request, env, params } = context;
  const origin = String(env.PYTHON_API_ORIGIN || '').replace(/\/$/, '');
  if (!origin) {
    return Response.json({ detail: 'PYTHON_API_ORIGIN is not configured for the Cloudflare copy.' }, { status: 503 });
  }

  const path = Array.isArray(params.path) ? params.path.join('/') : (params.path || '');
  const incoming = new URL(request.url);
  const target = new URL(`${origin}/api/${path}`);
  target.search = incoming.search;

  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.set('x-forwarded-host', incoming.host);
  headers.set('x-forwarded-proto', incoming.protocol.replace(':', ''));

  const init = { method: request.method, headers, redirect: 'manual' };
  if (!['GET', 'HEAD'].includes(request.method)) init.body = request.body;

  const response = await fetch(target, init);
  const outHeaders = new Headers(response.headers);
  outHeaders.set('x-make-it-pretty-backend', 'cloudflare-python-worker');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: outHeaders,
  });
}
