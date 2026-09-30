import { fastifyApp } from '@cordibase/service-monolith';
import { NextRequest } from 'next/server';

async function handleRequest(request: NextRequest) {
  // Ensure fastify is ready
  await fastifyApp.ready();

  const url = new URL(request.url);
  // Fastify expects the path + query string
  const pathWithQuery = url.pathname + url.search;

  // Convert Next.js Headers to a standard object for Fastify
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  // Read the body if present
  let body: Buffer | string | undefined = undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const arrayBuffer = await request.arrayBuffer();
    if (arrayBuffer.byteLength > 0) {
      body = Buffer.from(arrayBuffer);
    }
  }

  // Inject the request directly into the Fastify routing engine (no HTTP server required!)
  const response = await fastifyApp.inject({
    method: request.method as any,
    url: pathWithQuery,
    headers,
    payload: body,
  });

  // Convert Fastify response headers back to standard Web Headers
  const responseHeaders = new Headers();
  for (const [key, value] of Object.entries(response.headers)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      value.forEach((v) => responseHeaders.append(key, v.toString()));
    } else {
      responseHeaders.set(key, value.toString());
    }
  }

  return new Response(response.rawPayload, {
    status: response.statusCode,
    headers: responseHeaders,
  });
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
export const OPTIONS = handleRequest;
export const HEAD = handleRequest;
