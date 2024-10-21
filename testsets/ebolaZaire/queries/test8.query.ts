import { TestCase } from '../../../src/testCase.ts';
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
        type: 'SQLResult',
        sql:
            'select metadata.geoLocCountry as geoLocCountry, COUNT(*) as count\n' +
            "from 'testsets/ebolaZaire/data/input_file.ndjson.zst' where metadata.authors LIKE 'A%' group by all order by geoLocCountry",
    },
};
export default test;
