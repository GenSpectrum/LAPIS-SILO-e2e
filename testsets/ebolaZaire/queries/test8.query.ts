import { TestCase } from '../../../testCase.ts';
const test: TestCase = {
    name: "Query that filters the data by authors beginning with 'A' and aggregates it by geoLocCountry and ncbiSubmitterCountry",
    endpoint: '/sample/aggregated',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
        'authors.regex': '^A.*',
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
        fileName: 'test8_result.json.zst',
        decompressFile: true,
    },
};
export default test;
