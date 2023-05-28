# Not Found

Handling not found routes can be done in the same way as handling middleware, and is relatively simple.

By default, `itty-fs-router` includes a fallback not found handler that returns a 404 response with the text `Not found`, when no custom handler is defined.

## Per-Route Not Found

In each route, you can export a `notFound` object that contains different not found handler functions to use for different methods, or for all methods.

```ts
// path: ./src/foo/bar.ts

import type { NotFound, RouteHandler } from 'itty-fs-router';

// GET /foo/bar
export const GET: RouteHandler = (req) => {
	return new Response('Hello, world!');
};

export const notFound: NotFound = {
	// POST /foo/bar, PUT /foo/bar, DELETE /foo/bar, etc.
	ALL: (req) => {
		return new Response('No route handler was defined for this method.', {
			status: 404,
		});
	},
};
```

## Per-Route-Level Not Found

You can also define a not found handler for all paths in a route group and its descendants with an `_not-found` file.

Like with per-route not found handlers, you can define the handler to be for a specific method, or for all methods.

```ts
// path: ./src/foo/_not-found.ts

import type { NotFoundRouteHandler } from 'itty-fs-router';

// GET /foo/*, POST /foo/*, PUT /foo/*, DELETE /foo/*, etc.
export const ALL: NotFoundRouteHandler = () => {
	return new Response('Not found (nested)', { status: 404 });
};
```

## Global Not Found

To define a global not found handler, you can create a standard route group-level not found handler that exports the `ALL` method. This will mean that it catches all requests to any method.

```ts
// path: ./src/_not-found.ts

import type { NotFoundRouteHandler } from 'itty-fs-router';

// GET /*, POST /*, PUT /*, DELETE /*, etc.
export const ALL: NotFoundRouteHandler = () => {
	return new Response('Not found (root)', { status: 404 });
};
```
