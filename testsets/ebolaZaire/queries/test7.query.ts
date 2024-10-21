import { TestCase } from '../../../src/testCase.ts';
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
        type: 'SQLResult',
        sql:
            'select metadata.geoLocCountry as geoLocCountry, metadata.ncbiSubmitterCountry as ncbiSubmitterCountry, COUNT(*) as count\n' +
            "from 'testsets/ebolaZaire/data/input_file.ndjson.zst' group by all order by geoLocCountry,ncbiSubmitterCountry",
    },
};
export default test;
