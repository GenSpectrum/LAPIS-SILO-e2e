export type RelativeFileResult = {
    relativeFilePath: string;
    decompressFile?: boolean;
};
export type ResultFileFormat = 'ndjson' | 'json';
export type AbsoluteFileResult = {
    absoluteFilePath: string;
    fileFormat: ResultFileFormat;
    decompressFile?: boolean;
};
export type SQLResult = {
    sql: string;
};
export type ResultObject = RelativeFileResult | AbsoluteFileResult | SQLResult;

export type TestCase = {
    name: string;
    endpoint: string;
    method: string;
    headers: Record<string, string>;
    body: Object;
    expectedStatusCode: number;
    expectedResponse: ResultObject;
};
