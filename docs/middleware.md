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

Defining middleware at a certain route level, i.e. affecting all routes in a folder or subfolder, is not currently supported.

It is a planned feature and will be coming soon.

## Global Middleware

Defining global middleware that affects all routes is not currently supported.

It is a planned feature and will be coming soon.
