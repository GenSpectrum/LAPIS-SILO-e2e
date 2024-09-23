import { TestCase } from '../../../testCase.ts';
const test: TestCase = {
    name: 'Query that filters for USA',
    endpoint: '/sample/details',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
        geoLocCountry: 'USA',
        fields: ['accessionVersion', 'accession'],
        orderBy: [
            {
                field: 'accessionVersion',
                type: 'ascending',
            },
        ],
    },
    expectedStatusCode: 200,
    expectedResponse: {
        fileName: 'test5_result.json.zst',
        decompressFile: true,
    },
};
export default test;
