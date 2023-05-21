# Route Patterns

`itty-fs-router` supports both its own syntax and `itty-router`'s syntax for route patterns.

A custom syntax that gets converted to `itty-router`'s syntax at built time was necessary to ensure that the route patterns can be used in file paths correctly.

## `itty-fs-router` Syntax

### Fixed Routes

Fixed routes are the simplest type of route. They are a string that must match the path exactly.

```ts
// path: ./src/foo/bar.ts

// GET /foo/bar
```

### Simple Route Parameters

To match a simple parameter in the path, it can be wrapped with square brackets. The parameter name is the text inside the brackets.

```ts
// path: ./src/foo/[bar].ts

// GET /foo/123 -> { bar: '123' }
```

### Optional Route Parameters

As the name suggests, optional parameters are not required to match the route. They are denoted by an extra pair of square brackets around the parameter name.

```ts
// path: ./src/foo/[[bar]].ts

// GET /foo/123 -> { bar: '123' }
// GET /foo -> {}
```

### File Formats and Extensions

To match file formats and extensions, you can combine different types of route patterns. This can allow you have flexibility with how you match the file extension.

```ts
// path: ./src/foo/[bar].[ext].ts

// GET /foo/123.json -> { bar: '123', ext: 'json' }
```

For instance, making the extension parameter optional might be useful too.

```ts
// path: ./src/foo/config.[[ext]].ts

// GET /foo/config.json -> { ext: 'json' }
// GET /foo/config -> {}
```

### Wildcard and Catch-All Routes

To match anything after the path, you can use a wildcard route. This will match any path that starts with the route.

```ts
// path: ./src/foo/*

// GET /foo/bar -> {}
// GET /foo/bar/baz -> {}
```

### Greedy Parameters

Greedy parameters will match anything after the path, and will include the rest of the path in the parameter. This is useful for matching URLs.

```ts
// path: ./src/foo/[...bar].ts

// GET /foo/bar -> { bar: 'bar' }
// GET /foo/bar/baz -> { bar: 'bar/baz' }
// GET /foo/https://github.com -> { bar: 'https://github.com' }
```

## `itty-router` Syntax

To read about the syntax that `itty-router` supports, and by proxy `itty-fs-router`, you can read the [itty-router documentation](https://itty.dev/itty-router/route-patterns).
