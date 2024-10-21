import { getTestSets, TestSet } from '../src/testSet.ts';
import { dockerComposeDown, dockerComposeLogs, dockerComposeUp } from '../src/docker.ts';

const DOCKER_COMMANDS = {
    up: dockerComposeUp,
    down: dockerComposeDown,
    logs: dockerComposeLogs,
};

const args = process.argv.slice(2);

if (args.length !== 1) {
    throw new Error(
        `This script expects exactly one argument, which must be one of the following: ${Object.keys(DOCKER_COMMANDS)}`,
    );
}

const testSets: TestSet[] = await getTestSets();

const dockerCommand = getDockerCommand(args[0]);

await Promise.all(testSets.map(dockerCommand));

function getDockerCommand(command: string): (testSet: TestSet) => Promise<any> {
    if (!(command in DOCKER_COMMANDS)) {
        throw new Error(`Invalid command: ${command}, expected one of ${Object.keys(DOCKER_COMMANDS)}`);
    }

    return DOCKER_COMMANDS[command as keyof typeof DOCKER_COMMANDS];
}
