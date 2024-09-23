import { TestCase } from '../../../testCase.ts';
const test: TestCase = {
    name: 'Query that aggregated all data by geoLocCountry and ncbiSubmitterCountry',
    endpoint: '/sample/aggregated',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
        fields: ['geoLocCountry', 'ncbiSubmitterCountry'],
        orderBy: [
            {
                field: 'geoLocCountry',
                type: 'ascending',
            },
            {
                field: 'ncbiSubmitterCountry',
                type: 'ascending',
            },
        ],
    },
    expectedStatusCode: 200,
    expectedResponse: {
        fileName: 'test7_result.json.zst',
        decompressFile: true,
    },
};
export default test;
