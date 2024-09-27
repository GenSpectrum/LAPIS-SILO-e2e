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
        sql:
            'select metadata.accession as accession,\n' +
            'metadata.accessionVersion as accessionVersion\n' +
            "from 'testsets/ebolaZaire/data/input_file.ndjson.zst' where metadata.geoLocCountry = 'Republic of the Congo' order by accessionVersion",
    },
};
export default test;
