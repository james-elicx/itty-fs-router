# itty-fs-router

## 0.3.0

### Minor Changes

- 2cf7f25: Ability to target Cloudflare Pages in addition to Workers when building, through the `--target` flag. The Pages build target has support for assets in a `/public` directory at the root of the project.
- c5fa9df: Support for middleware and not found responses at the root-level and route group-level through `_middleware.ts` and `_not-found.ts`.
- c5fa9df: Support for itty-router v4.

### Patch Changes

- c5fa9df: Fix precendence order for nested files, like middleware.

## 0.2.1

### Minor Changes

- 0c6324d: Per-route middleware on a per-method basis.
- 0c6324d: Per-route not-found on a per-method basis.
- 364f7e2: Support for square brackets friendly route patterns.
- 0c6324d: Basic file-system based routing by exported methods.

### Patch Changes

- 0c6324d: Fix itty-router's route patterns not matching the route extraction regex.
- 0959c29: Fix published package not being runnable because of missing shebangs.
- 364f7e2: Fix adding source projects treating paths as globs instead of absolute paths.
- 0959c29: Fix `--help` flag not running when the root directory is invalid.
