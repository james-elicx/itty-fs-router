import type { IRequest } from 'itty-router';

export type Method = 'ALL' | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

export type IttyFsParams = IRequest['params'];
export type IttyFsQuery = IRequest['query'];
export type IttyFsCtx = Record<string, unknown>;
export type IttyFsEnv = Record<string, unknown>;

export type IncomingRequest<
	TParams extends IttyFsParams = IttyFsParams,
	TQuery extends IttyFsQuery = IttyFsQuery,
	TCtx extends IttyFsCtx = IttyFsCtx,
> = Request & Omit<IRequest, 'query' | 'params'> & { params: TParams; query: TQuery; ctx: TCtx };

type BaseRouteHandler<
	TParams extends IttyFsParams = IttyFsParams,
	TQuery extends IttyFsQuery = IttyFsQuery,
	TCtx extends IttyFsCtx = IttyFsCtx,
	TEnv extends IttyFsEnv = IttyFsEnv,
	TResp = unknown,
> = (req: IncomingRequest<TParams, TQuery, TCtx>, env: TEnv, ctx: ExecutionContext) => TResp;

export type RouteHandler<
	TParams extends IttyFsParams = IttyFsParams,
	TQuery extends IttyFsQuery = IttyFsQuery,
	TCtx extends IttyFsCtx = IttyFsCtx,
	TEnv extends IttyFsEnv = IttyFsEnv,
> = BaseRouteHandler<TParams, TQuery, TCtx, TEnv, unknown>;

export type MiddlewareRouteHandler<
	TParams extends IttyFsParams = IttyFsParams,
	TQuery extends IttyFsQuery = IttyFsQuery,
	TCtx extends IttyFsCtx = IttyFsCtx,
	TEnv extends IttyFsEnv = IttyFsEnv,
> = BaseRouteHandler<TParams, TQuery, TCtx, TEnv, never | void | undefined | null>;

export type NotFoundRouteHandler = RouteHandler;

export type Middleware = { [K in Method]?: MiddlewareRouteHandler | MiddlewareRouteHandler[] };
export type NotFound = { [K in Method]?: NotFoundRouteHandler | NotFoundRouteHandler[] };
