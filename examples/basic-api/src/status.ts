import type { RouteHandler } from 'itty-fs-router';

export const GET: RouteHandler = () => new Response('OK', { status: 200 });
