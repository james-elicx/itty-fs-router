import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'fs';
import { resolve } from 'path';

const packageJson = readFileSync(resolve('package.json'), 'utf-8');
const withoutDist = packageJson.replace(/dist\//g, '');
writeFileSync(resolve('dist', 'package.json'), withoutDist);

copyFileSync(resolve('README.md'), resolve('dist', 'README.md'));
copyFileSync(resolve('..', '..', 'LICENSE.md'), resolve('dist', 'LICENSE.md'));

const cliJs = readFileSync(resolve('dist', 'cli', 'index.js'), 'utf-8');
const cliCjs = readFileSync(resolve('dist', 'cli', 'index.cjs'), 'utf-8');

const cliJsFixed = `#!/usr/bin/env node\n${cliJs}`;
const cliCjsFixed = `#!/usr/bin/env node\n${cliCjs}`;

writeFileSync(resolve('dist', 'cli', 'index.js'), cliJsFixed);
writeFileSync(resolve('dist', 'cli', 'index.cjs'), cliCjsFixed);
