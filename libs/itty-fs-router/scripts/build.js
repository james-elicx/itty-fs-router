import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'fs';
import { resolve } from 'path';

const packageJson = readFileSync(resolve('package.json'), 'utf-8');
const withoutDist = packageJson.replace(/dist\//g, '');
writeFileSync(resolve('dist', 'package.json'), withoutDist);

copyFileSync(resolve('README.md'), resolve('dist', 'README.md'));
copyFileSync(resolve('..', '..', 'LICENSE.md'), resolve('dist', 'LICENSE.md'));
