import { TestCase } from '../../../testCase.ts';
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
        type: 'RelativeFileResult',
        relativeFilePath: 'query1.result.json',
    },
};
export default test;
