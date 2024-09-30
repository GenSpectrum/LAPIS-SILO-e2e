import { TestCase } from '../../../testCase.ts';
const test: TestCase = {
    name: 'Test query',
    endpoint: '/sample/aggregated',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
        country: 'Switzerland',
        fields: ['division', 'country'],
        orderBy: [
            {
                field: 'division',
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
