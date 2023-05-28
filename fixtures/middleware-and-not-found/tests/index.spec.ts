import { buildWorker, type Worker } from '@fixtures/utils';
import { createWorker } from '@fixtures/utils';
import { beforeAll, afterAll, expect, suite, test } from 'vitest';

let worker: Worker;

beforeAll(async () => {
	await buildWorker();
	worker = await createWorker('dist/index.js');
});

afterAll(async () => {
	await worker.stop();
});

suite('Middleware files', () => {
	test('Root-level route only gets root middleware', async () => {
		const resp = await worker.fetch('/hello');

		expect(resp.status).toEqual(200);
		expect(resp.rawText).toMatchInlineSnapshot(`"{\\"root\\":\\"Context from root middleware\\"}"`);
	});

	test('Root group-level route only gets root + group middleware', async () => {
		const resp = await worker.fetch('/nested/hello');

		expect(resp.status).toEqual(200);
		expect(resp.rawText).toMatchInlineSnapshot(
			`"{\\"root\\":\\"Context from root middleware\\",\\"nested\\":\\"Context from nested middleware\\"}"`,
		);
	});

	test('Root group-level route only gets root + group + route middleware', async () => {
		const resp = await worker.fetch('/nested/hello', { method: 'POST' });

		expect(resp.status).toEqual(200);
		expect(resp.rawText).toMatchInlineSnapshot(
			`"{\\"root\\":\\"Context from root middleware\\",\\"nested\\":\\"Context from nested middleware\\",\\"route\\":\\"Context from route middleware\\"}"`,
		);
	});
});

suite('Not found files', () => {
	test('Root-level route only gets root not-found', async () => {
		const resp = await worker.fetch('/invalid');

		expect(resp.status).toEqual(404);
		expect(resp.rawText).toMatchInlineSnapshot(`"Not found (root)"`);
	});

	test('Root group-level route only gets group not-found', async () => {
		const resp = await worker.fetch('/nested/invalid');

		expect(resp.status).toEqual(404);
		expect(resp.rawText).toMatchInlineSnapshot(`"Not found (nested)"`);
	});

	test('Root group-level route only gets route not-found', async () => {
		const resp = await worker.fetch('/nested/hello', { method: 'PUT' });

		expect(resp.status).toEqual(404);
		expect(resp.rawText).toMatchInlineSnapshot(`"Not found (route)"`);
	});
});
