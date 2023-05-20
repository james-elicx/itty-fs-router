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

suite('itty-router syntax', () => {
	test('Fixed route', async () => {
		const resp = await worker.fetch('/itty-router-syntax/fixed');

		expect(resp.status).toEqual(200);
		expect(resp.rawText).toMatchInlineSnapshot(`"fixed route"`);
	});

	test('Query params', async () => {
		const resp = await worker.fetch('/itty-router-syntax/query-params?foo=bar&baz');

		expect(resp.status).toEqual(200);
		expect(resp.rawText).toMatchInlineSnapshot(
			`"query params: {\\"foo\\":\\"bar\\",\\"baz\\":\\"\\"}"`,
		);
	});

	test('Simple params with no param 404s', async () => {
		const resp = await worker.fetch('/itty-router-syntax/simple-params/');

		expect(resp.status).toEqual(404);
		expect(resp.rawText).toMatchInlineSnapshot(`"Not found"`);
	});

	test('Simple params', async () => {
		const resp = await worker.fetch('/itty-router-syntax/simple-params/123');

		expect(resp.status).toEqual(200);
		expect(resp.rawText).toMatchInlineSnapshot(`"simple params: {\\"id\\":\\"123\\"}"`);
	});

	test('File extensions with no file 404s', async () => {
		const resp = await worker.fetch('/itty-router-syntax/file-extensions/');

		expect(resp.status).toEqual(404);
		expect(resp.rawText).toMatchInlineSnapshot(`"Not found"`);
	});

	test('File extensions with extension', async () => {
		const resp = await worker.fetch('/itty-router-syntax/file-extensions/manifest.json');

		expect(resp.status).toEqual(200);
		expect(resp.rawText).toMatchInlineSnapshot(
			`"file extensions: {\\"file\\":\\"manifest\\",\\"extension\\":\\"json\\"}"`,
		);
	});

	test('File extensions without extension', async () => {
		const resp = await worker.fetch('/itty-router-syntax/file-extensions/manifest');

		expect(resp.status).toEqual(200);
		expect(resp.rawText).toMatchInlineSnapshot(`"file extensions: {\\"file\\":\\"manifest\\"}"`);
	});

	test('Option params with param', async () => {
		const resp = await worker.fetch('/itty-router-syntax/optional-params/deploy');

		expect(resp.status).toEqual(200);
		expect(resp.rawText).toMatchInlineSnapshot(`"optional params: {\\"action\\":\\"deploy\\"}"`);
	});

	test('Option params without param still matches', async () => {
		const resp = await worker.fetch('/itty-router-syntax/optional-params/');

		expect(resp.status).toEqual(200);
		expect(resp.rawText).toMatchInlineSnapshot(`"optional params: {}"`);
	});

	test('Greedy params catches everything following it', async () => {
		const resp = await worker.fetch('/itty-router-syntax/greedy-params/https://google.com');

		expect(resp.status).toEqual(200);
		expect(resp.rawText).toMatchInlineSnapshot(
			`"greedy params: {\\"url\\":\\"https://google.com\\"}"`,
		);
	});

	test('Greedy params without param still matches', async () => {
		const resp = await worker.fetch('/itty-router-syntax/greedy-params/');

		expect(resp.status).toEqual(200);
		expect(resp.rawText).toMatchInlineSnapshot(`"greedy params: {\\"url\\":\\"\\"}"`);
	});

	test('Wildcard catches anything after it', async () => {
		const resp = await worker.fetch('/itty-router-syntax/wildcard/foo/bar/baz');

		expect(resp.status).toEqual(200);
		expect(resp.rawText).toMatchInlineSnapshot(`"wildcard"`);
	});
});
