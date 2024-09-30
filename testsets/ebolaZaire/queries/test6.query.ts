import { TestCase } from '../../../testCase.ts';
const test: TestCase = {
    name: 'Query that aggregates all data by geoLocCountry',
    endpoint: '/sample/aggregated',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
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
            "from 'testsets/ebolaZaire/data/input_file.ndjson.zst' group by all order by geoLocCountry",
    },
};
export default test;
