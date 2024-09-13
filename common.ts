import { execSync } from 'child_process';
import { ExecSyncOptions } from 'node:child_process';

const PROJECT_PREFIX = 'lapis-silo-e2e-';

export function dockerComposeUp(projectName: string, dockerComposeEnv: string[]) {
    const dockerComposeUpCommand = [
        ...dockerComposeEnv,
        'docker',
        'compose',
        `--project-name=${PROJECT_PREFIX}${projectName}`,
        '--progress=plain',
        'up',
        '--quiet-pull',
        '--detach',
        '--wait',
    ].join(' ');

    console.log(dockerComposeUpCommand);
    const execOptions: ExecSyncOptions = process.env.VERBOSE ? { stdio: 'inherit' } : { stdio: 'ignore' };
    execSync(dockerComposeUpCommand, execOptions);
}

export function dockerComposeDown(testName: string) {
    const dockerComposeDownCommand = [
        'docker',
        'compose',
        `--project-name=${PROJECT_PREFIX}${testName}`,
        '--progress=plain',
        'down',
    ].join(' ');

    console.log(dockerComposeDownCommand);
    const execOptions: ExecSyncOptions = process.env.VERBOSE ? { stdio: 'inherit' } : { stdio: 'ignore' };
    execSync(dockerComposeDownCommand, execOptions);
}
