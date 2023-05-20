import type { IRequest } from 'itty-router';

export type Method = 'ALL' | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

type IttyParams = IRequest['params'];
type IttyQuery = IRequest['query'];
type BaseCtx = Record<string, unknown>;
type BaseEnv = Record<string, unknown>;

export type IncomingRequest<
	TParams extends IttyParams = IttyParams,
	TQuery extends IttyQuery = IttyQuery,
	TCtx extends BaseCtx = BaseCtx,
> = Request & Omit<IRequest, 'query' | 'params'> & { params: TParams; query: TQuery; ctx: TCtx };

type BaseRouteHandler<
	TParams extends IttyParams = IttyParams,
	TQuery extends IttyQuery = IttyQuery,
	TCtx extends BaseCtx = BaseCtx,
	TEnv extends BaseEnv = BaseEnv,
	TResp = unknown,
> = (req: IncomingRequest<TParams, TQuery, TCtx>, env: TEnv, ctx: ExecutionContext) => TResp;

export type RouteHandler<
	TParams extends IttyParams = IttyParams,
	TQuery extends IttyQuery = IttyQuery,
	TCtx extends BaseCtx = BaseCtx,
	TEnv extends BaseEnv = BaseEnv,
> = BaseRouteHandler<TParams, TQuery, TCtx, TEnv, unknown>;

export type MiddlewareRouteHandler<
	TParams extends IttyParams = IttyParams,
	TQuery extends IttyQuery = IttyQuery,
	TCtx extends BaseCtx = BaseCtx,
	TEnv extends BaseEnv = BaseEnv,
> = BaseRouteHandler<TParams, TQuery, TCtx, TEnv, never | void | undefined | null>;

export type NotFoundRouteHandler = RouteHandler;

export type Middleware = { [K in Method]?: MiddlewareRouteHandler | MiddlewareRouteHandler[] };
export type NotFound = { [K in Method]?: NotFoundRouteHandler | NotFoundRouteHandler[] };
