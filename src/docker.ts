import { exec } from 'child_process';
import { ExecSyncOptions } from 'node:child_process';
import { promisify } from 'util';
import { TestSet } from './testSet.js';
import path from 'path';
import fs from 'fs';

const PROJECT_PREFIX = 'lapis-silo-e2e-';
const LOG_DIR = 'logs';

const execAsync = promisify(exec);

export function dockerComposeUp(testSet: TestSet) {
    const projectName = getDockerComposeProjectName(testSet);

    const dataDir = path.join(testSet.path, 'data');
    const outputDir = path.join(testSet.path, 'output');
    if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true, force: true });
    }
    fs.mkdirSync(outputDir);

    const dockerComposeEnv = [
        'LAPIS_TAG=latest',
        'SILO_TAG=latest',
        `LAPIS_PORT=${testSet.lapisPort}`,
        `SILO_PORT=${testSet.siloPort}`,
        `TESTSET_DATA_FOLDER=${dataDir}`,
        `TESTSET_OUTPUT_FOLDER=${outputDir}`,
    ];

    return execute([
        ...dockerComposeEnv,
        'docker',
        'compose',
        `--project-name=${projectName}`,
        '--progress=plain',
        'up',
        '--quiet-pull',
        '--detach',
        '--wait',
    ]);
}

export function dockerComposeDown(testSet: TestSet) {
    const projectName = getDockerComposeProjectName(testSet);

    return execute(['docker', 'compose', `--project-name=${projectName}`, '--progress=plain', 'down']);
}

export async function dockerComposeLogs(testSet: TestSet) {
    const projectName = getDockerComposeProjectName(testSet);

    const { stdout, stderr } = await execute(['docker', 'compose', `--project-name=${projectName}`, 'logs']);

    const logFile = `${LOG_DIR}/${projectName}.log`;
    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR);
    }
    console.log(`writing logs to ${logFile}`);
    return fs.writeFileSync(logFile, stdout, { flag: 'w+' });
}

function getDockerComposeProjectName(testSet: TestSet) {
    const testBaseDir = path.basename(testSet.path);
    const testName = testBaseDir.toLowerCase();
    return `${PROJECT_PREFIX}${testName}`;
}

function execute(dockerComposeUpCommand: string[]) {
    const command = dockerComposeUpCommand.join(' ');
    console.log(command);
    const execOptions: ExecSyncOptions = process.env.VERBOSE ? { stdio: 'inherit' } : { stdio: 'ignore' };
    return execAsync(command, execOptions);
}
