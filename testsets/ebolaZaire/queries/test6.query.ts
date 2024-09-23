import { TestCase } from '../../../testCase.ts';
const test: TestCase = {
    name: 'Query that aggregates all data by geoLocCountry',
    endpoint: '/sample/aggregated',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
        fields: ['geoLocCountry'],
        orderBy: [
            {
                field: 'geoLocCountry',
                type: 'ascending',
            },
        ],
    },
    expectedStatusCode: 200,
    expectedResponse: {
        fileName: 'test6_result.json.zst',
        decompressFile: true,
    },
};
export default test;
