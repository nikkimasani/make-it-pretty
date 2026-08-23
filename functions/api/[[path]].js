const DEFAULT_ORIGIN = 'https://make-it-pretty.vercel.app';

export async function onRequest(context) {
  const { request, env, params } = context;
  const origin = (env.VERCEL_API_ORIGIN || DEFAULT_ORIGIN).replace(/\/$/, '');
  const path = Array.isArray(params.path) ? params.path.join('/') : (params.path || '');
  const incoming = new URL(request.url);
  const target = new URL(`${origin}/api/${path}`);
  target.search = incoming.search;

  const headers = new Headers(request.headers);
  headers.delete('host');

  const init = {
    method: request.method,
    headers,
    redirect: 'manual',
  };
  if (!['GET', 'HEAD'].includes(request.method)) init.body = request.body;

  const response = await fetch(target, init);
  const outHeaders = new Headers(response.headers);
  outHeaders.set('x-make-it-pretty-backend', 'vercel-bridge');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: outHeaders,
  });
}
