import { TestCase } from '../../../src/testCase.ts';
const test: TestCase = {
    name: 'Query that filters for all open data',
    endpoint: '/sample/details',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
        dataUseTerms: 'OPEN',
        fields: ['accessionVersion', 'accession', 'dataUseTerms'],
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
            'metadata.accessionVersion as accessionVersion,\n' +
            'metadata.dataUseTerms as dataUseTerms\n' +
            "from 'testsets/ebolaZaire/data/input_file.ndjson.zst' where dataUseTerms = 'OPEN' order by accessionVersion",
    },
};
export default test;
