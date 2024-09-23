import { TestCase } from '../../../testCase.ts';
const test: TestCase = {
    name: 'Query that filters for the Republic of the Congo',
    endpoint: '/sample/details',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
        geoLocCountry: 'Republic of the Congo',
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
        fileName: 'test4_result.json.zst',
        decompressFile: true,
    },
};
export default test;
