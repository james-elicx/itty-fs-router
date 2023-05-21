<p align="center">
  <h3 align="center">itty-fs-router</h3>

  <p align="center">
    Simple and fast file-system based router,
    <br />
    powered by <a href="https://github.com/kwhitley/itty-router">itty-router</a>.
  </p>
</p>

---

<p align="center">
  <a href="https://npmjs.com/package/itty-fs-router" target="_blank">
		<img alt="npm (tag)" src="https://img.shields.io/npm/v/itty-fs-router/latest?color=3777FF&style=flat-square" />
	</a>
	<img alt="GitHub Workflow Status (with branch)" src="https://img.shields.io/github/actions/workflow/status/james-elicx/itty-fs-router/release.yml?branch=main&color=95FF38&style=flat-square" />
</p>

---

`itty-fs-router` is a powerful file-system router. You can use the file-system to define routes, instead of defining them all in one place, allowing you to organize your routes in a way that makes sense for your project.

Under the hood, this tooling uses [`itty-router`](https://github.com/kwhitley/itty-router). Itty is an incredibly small and feature-rich router, with super fast performance.

## Features

- File-system based routing.
- [Middleware](/docs/middleware.md).
- [Not found](/docs/not-found.md) handlers.
- [Route patterns](/docs/route-patterns.md); params, wildcards, greedy params, and more.

Support for more features is coming soon!

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

### Route Params and Patterns

Route params can be defined using two syntaxes; the one that this library provides, or the same syntax that `itty-router` uses.

The syntax `itty-fs-router` (this library) provides is as follows. For more information, take a look at our [docs](/docs/route-patterns.md).

- simple params: `[param]`
- optional params: `[[param]]`
- wildcard: `[...]`
- greedy params: `[...param]`
- file extensions: `[param].ext`, `name.[[ext]]`, etc.

If you would like to use `itty-router`'s syntax to define route params, greedy params, wildcards, etc., check out the [itty-router docs](https://itty.dev/itty-router/route-patterns).

### Middleware and Not Found

By default, `itty-fs-router` adds a global `Not found` response for any unmatched routes. This can be overriden on a per-route basis by exporting an object. (per-route segment and project-wide is coming soon)

Middleware and Not Found responses can be defined on a per-method basis, or for all methods using `ALL`.

Check out our documentation for [middleware](/docs/middleware.md) and [not found](/docs/not-found.md) for more information.

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

Contributions are welcome! Please read our [contribution guidelines](/CONTRIBUTING.md) for more information.
