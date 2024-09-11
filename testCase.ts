export type ResultObject = {
    fileName: string;
    decompressFile?: boolean;
};

export type TestCase = {
    name: string;
    endpoint: string;
    method: string;
    headers: Record<string, string>;
    body: Object;
    expectedStatusCode: number;
    expectedResponse: ResultObject;
};
