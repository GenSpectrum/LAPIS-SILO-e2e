import { TestCase } from '../../../testCase.ts';
const test: TestCase = {
    name: 'Query that filters for all restricted data',
    endpoint: '/sample/details',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
        dataUseTerms: 'RESTRICTED',
        fields: ['accessionVersion', 'accession', 'dataUseTerms', 'dataUseTermsRestrictedUntil'],
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
            'metadata.dataUseTerms as dataUseTerms,\n' +
            'metadata.dataUseTermsRestrictedUntil as dataUseTermsRestrictedUntil\n' +
            "from 'testsets/ebolaZaire/data/input_file.ndjson.zst' where dataUseTerms = 'RESTRICTED' order by accessionVersion",
    },
};
export default test;
