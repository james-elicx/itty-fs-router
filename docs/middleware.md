# Middleware

This library supports middleware in multiple ways, and due to how `itty-router` works, technically any route that doesn't return a response could also be used as middleware.

## Per-Route Middleware

In each route, you can export a `middleware` object that contains different middleware functions to use for different methods, or for all methods.

```ts
// path: ./src/foo/bar.ts

import type { Middleware, RouteHandler } from 'itty-fs-router';

export const middleware: Middleware = {
	// GET /foo/bar
	GET: (req) => {
		req.ctx['from-middleware'] = 'Hello from middleware';
	},
};

// GET /foo/bar
export const GET: RouteHandler = (req) => {
	const middlewareCtx = req.ctx['from-middleware'];

	return new Response(`Middleware Context: '${middlewareCtx}'`);
};
```

## Per-Route-Level Middleware

You can also define a middleware function for all paths in a route group and its descendants with an `_middleware` file.

Like with per-route middleware, you can define the middleware to be for a specific method, or for all methods.

```ts
// path: ./src/foo/_middleware.ts

import type { MiddlewareRouteHandler } from 'itty-fs-router';

// GET /foo/*, POST /foo/*, PUT /foo/*, DELETE /foo/*, etc.
export const ALL: MiddlewareRouteHandler = (req) => {
	req.ctx['from-middleware-nested'] = 'Context from nested middleware';
};
```

## Global Middleware

To define a global middleware handler, you can create a standard route group-level not found handler that exports the `ALL` method. This will mean that it catches all requests to any method.

```ts
// path: ./src/_middleware.ts

import type { MiddlewareRouteHandler } from 'itty-fs-router';

// GET /*, POST /*, PUT /*, DELETE /*, etc.
export const ALL: MiddlewareRouteHandler = (req) => {
	req.ctx['from-middleware-root'] = 'Context from root middleware';
};
```
