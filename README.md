<p align="center">
  <h3 align="center">itty-fs-router</h3>

  <p align="center">
    Simple and fast file-system based router,
    <br />
    powered by <a href="https://github.com/kwhitley/itty-router">itty-router</a>.
  </p>
</p>

---

`itty-fs-router` is a powerful file-system router. You can use the file-system to define routes, instead of defining them all in one place, allowing you to organize your routes in a way that makes sense for your project.

Under the hood, this tooling uses [`itty-router`](https://github.com/kwhitley/itty-router). Itty is an incredibly small and feature-rich router, with super fast performance.

## Features

- File-system based routing
- Middleware
- Not found responses
- Route params, wildcards, greedy params, and [more](https://itty.dev/itty-router/route-patterns)

## Getting Started

### Installation

To get started with `itty-fs-router`, you'll first need to install it in your project.

```sh
npm install itty-fs-router
```

### Defining Routes

To define a route, simply create a new file. The path to the file will be the path of the route. As an example, the following paths would map to following routes:

- `/index.ts` -> `/`
- `/foo/bar.ts` -> `/foo/bar`

Routes can be defined on a per-method basis, or for all methods using `ALL`.

```ts
// path: ./src/index.ts

import type { RouteHandler } from 'itty-fs-router';

// GET /
export const GET: RouteHandler = () => {
	return new Response('Hello world!', { status: 200 });
};
```

### Middleware and Not Found

By default, `itty-fs-router` adds a global `Not found` response for any unmatched routes. This can be overriden on a per-route basis by exporting an object. (per-route segment and project-wide is coming soon)

Middleware and Not Found responses can be defined on a per-method basis, or for all methods using `ALL`.

```ts
// path: ./src/index.ts

import type { Middleware, NotFound, RouteHandler } from 'itty-fs-router';

// GET /
export const GET: RouteHandler = (req) => {
	const middlewareCtx = req.ctx['from-middleware'];

	return new Response(`Middleware Context: '${middlewareCtx}'`);
};

export const middleware: Middleware = {
	// GET /
	GET: (req) => {
		req.ctx['from-middleware'] = 'Context from middleware';
	},
};

export const notFound: NotFound = {
	// POST /, PUT /, DELETE /, etc.
	ALL: () => {
		return new Response('No route handler was defined for this request method', { status: 404 });
	},
};
```

### Route params

Route params can be defined using the same syntax that `itty-router` uses. For more information about how to define route params, greedy params, wildcards, and more, check out the [itty-router docs](https://itty.dev/itty-router/route-patterns).

### Deploying

To deploy your project, you will need to build it. This can be done by running the following in your project's directory.

```sh
npx itty-fs-router
```

Then, you can deploy the `dist` directory (or whatever directory you specified in the CLI arguments).

For more information about CLI arguments, run the following.

```sh
npx itty-fs-router --help
```

## Contributing

Contributions are welcome! Please read our [contribution guidelines](./CONTRIBUTING.md) for more information.
