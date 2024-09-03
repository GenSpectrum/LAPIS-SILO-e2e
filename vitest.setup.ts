import { execSync } from 'child_process';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';


const LAPIS_PORT = "8080";

// Helper function to get all test set directories
function getTestsetDirectories() {
    const testsetsPath = path.resolve(__dirname, 'testsets');
    return fs.readdirSync(testsetsPath)
        .filter(name => fs.lstatSync(path.join(testsetsPath, name)).isDirectory())
        .map(name => path.join(testsetsPath, name));
}

// Iterate over each test set directory
getTestsetDirectories().forEach((testsetDir) => {
    console.log(`Hello testset: ${testsetDir}...`);
    const dataDir = path.join(testsetDir, 'data');
    const queriesDir = path.join(testsetDir, 'queries');
    const dockerComposeFile = 'docker-compose.yml';

    describe(`Testset: ${path.basename(testsetDir)}`, () => {
        beforeAll(() => {
            if (fs.existsSync(dockerComposeFile)) {
                console.log(`Starting Docker Compose for ${testsetDir}...`);

                const outputFolder = fs.mkdtempSync(path.join(testsetDir, "output_"));

                const dockerComposeEnv = `LAPIS_TAG=latest SILO_TAG=latest TESTSET_DATA_FOLDER=${dataDir} TESTSET_OUTPUT_FOLDER=${outputFolder}`;

                const dockerComposeCommand = `${dockerComposeEnv} docker compose up --wait`;

                console.log(dockerComposeCommand);

                execSync(dockerComposeCommand, { stdio: 'inherit' });
            }
        });

        afterAll(() => {
            if (fs.existsSync(dockerComposeFile)) {
                console.log(`Stopping Docker Compose for ${testsetDir}...`);
                execSync(`docker-compose down`, { stdio: 'inherit' });
            }
        });

        // Load and execute each test case from the queries folder
        fs.readdirSync(queriesDir).forEach((file) => {
            if(!file.endsWith(".query.json")){
                return;
            }
            const filePath = path.join(queriesDir, file);
            const testCase = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

            it(`should validate query from ${file}`, async () => {
                if(!testCase.name || !testCase.endpoint || !testCase.method || !testCase.headers){
                    console.log(`The query '${file}' must contain name, endpoint, method and headers`)
                    expect(false);
                }

                const url = path.join("http://localhost:" + LAPIS_PORT, testCase.endpoint)

                const requestOptions = {
                    method: testCase.method,
                    headers: testCase.headers,
                    body: testCase.body
                };

                console.log(`requestOptions: ${requestOptions}`);

                const response = await fetch(url, requestOptions);
                if(testCase.expectedResponse && testCase.expectedResponse.fileName){
                    const responseFile = path.join(queriesDir, testCase.expectedResponse.fileName)
                    const expectedResponse = fs.readFileSync( responseFile, 'utf-8');
                    const actualResponseBuffer = await response.body.getReader().read();
                    const decoder = new TextDecoder('utf-8');
                    const actualResponse = decoder.decode(actualResponseBuffer.value);

                    expect(actualResponse).to.equal(expectedResponse);
                }
            });
        });
    });
});
