import assert from 'node:assert';
import { resolve } from 'node:path';
import { loadEnvFile } from 'node:process';
import { describe, it } from 'node:test';
import { TEST_MONOREPO_ROOT, testCreate } from './common.js';

loadEnvFile(resolve(TEST_MONOREPO_ROOT, '.env'));

describe('basic test', () => {
	it('should pass', async () => {
		const client = testCreate(true);

		client.onRequest(() => {
			console.log('Request made to Bangumi API');
		});
		client.onResponse(() => {
			console.log('Response received from Bangumi API');
		});

		// await client._get(ApiPaths.getSubjectById, { params: { path: { subject_id: 123 } } });
		// await client._post(ApiPaths.postUserCollection, { params: { path: { subject_id: 123 } }, body: { comment: '123' }  });
		const r = await client.getMyself();
		assert(typeof r.id === 'number', 'Expected user ID to be a number');
	});
});
