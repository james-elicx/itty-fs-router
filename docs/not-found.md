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

Defining not found handlers at a certain route level, i.e. affecting all routes in a folder or subfolder, is not currently supported.

It is a planned feature and will be coming soon.

## Global Not Found

Defining global not found handlers that affects all routes is not currently supported.

It is a planned feature and will be coming soon.
