import { TestCase } from '../../../testCase.ts';
const test: TestCase = {
    name: 'Query that filters for the Democratic Republic of the Congo',
    endpoint: '/sample/details',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
        geoLocCountry: 'Democratic Republic of the Congo',
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
        fileName: 'test3_result.json.zst',
        decompressFile: true,
    },
};
export default test;
