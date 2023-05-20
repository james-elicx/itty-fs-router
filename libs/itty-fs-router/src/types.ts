import type { IRequest } from 'itty-router';

export type Method = 'ALL' | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

export type IncomingRequest = Request & IRequest & { ctx: Record<string, unknown> };

export type RouteHandler = (
	req: IncomingRequest,
	env: Record<string, unknown>,
	ctx: ExecutionContext,
) => unknown;

export type MiddlewareConfig = { [K in Method]?: RouteHandler | RouteHandler[] };
