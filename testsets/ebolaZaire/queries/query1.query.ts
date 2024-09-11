import { TestCase } from '../../../testCase.spec.js';
const test: TestCase = {
    name: 'Test query',
    endpoint: '/sample/details',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
        geoLocCountry: 'Switzerland',
        fields: ['hostNameScientific', 'geoLocCountry', 'accessionVersion'],
        orderBy: [
            {
                field: 'hostNameScientific',
                type: 'ascending',
            },
        ],
    },
    expectedStatusCode: 200,
    expectedResponse: {
        fileName: 'query1.result.json',
    },
};
export default test;
