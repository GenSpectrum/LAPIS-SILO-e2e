import { TestCase } from '../../../src/testCase.ts';
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
        type: 'SQLResult',
        sql:
            'select metadata.accession as accession,\n' +
            'metadata.accessionVersion as accessionVersion\n' +
            "from 'testsets/ebolaZaire/data/input_file.ndjson.zst' where metadata.geoLocCountry = 'USA' order by accessionVersion",
    },
};
export default test;
