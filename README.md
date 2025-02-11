# LAPIS-SILO End-to-End Testing

This repository contains end-to-end tests for the LAPIS API backed by SILO. It's designed to make adding new test cases easy and straightforward, while ensuring all endpoints and functionalities work as expected.

## Features

- **Docker Integration**: Utilizes Docker Compose to manage test environments for LAPIS and SILO.
- **Automated Testing**: Runs tests using Vitest to ensure all endpoints and functionalities are working as expected.
- **Configuration Flexibility**: Configurable test sets and environments through Docker and external YAML/JSON files.
- **Dynamic Test Set Detection**: Automatically detects and runs tests for all test sets in the `/testsets/` directory.

## Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose
- [Node.js](https://nodejs.org/en/) (version specified in `package.json`)
- [npm](https://www.npmjs.com/get-npm)

## Running tests

1. Install dependencies:

    ```bash
    npm ci
    ```

2. Run tests:

    ```bash
    npm test
    ```

    This command will start up the Docker containers and execute all defined tests.

3. Stop Docker containers:

    ```bash
    npm run dockerDown
    ```

Also, tests can be rerun without restarting all containers by calling `npm run testRunner` after `npm run dockerUp` directly.

## Configuration

Modify the `database_config.yaml`, `reference_genomes.json`, and any other configuration files in the `testsets` directory according to your test requirements.

## Project Structure

- `/testsets/`: Contains individual test sets. Each test set is a directory that includes:
    - `data/`: Input data for the test set
    - `queries/`: Test queries and expected responses
    - `output/`: Output directory for SILO preprocessing
- `docker-compose.yml`: Defines the LAPIS and SILO services
- `bin/`: Scripts to be executed via `npm run`
- `src/`: Main code for the tests
    - `src/testset.spec.ts`: Main test script that runs all queries for all test sets
- `vitest.config.ts`: Vitest configuration
- `package.json`: Defines project dependencies and scripts
- `.prettierrc`: Prettier configuration for code formatting

## Adding New Test Sets

To add a new test set:

1. Create a new directory under `/testsets/`
2. Add necessary data files to the `data/` subdirectory
3. Create query files in the `queries/` subdirectory (must end with `.query.ts`)
4. Add expected response files if needed

The test runner will automatically detect and run tests for all test sets in the `/testsets/` directory.

If the added queries contain test, whose expectedResponse-body is a `sql:` statement, the test files need to be generated before running `npm test` by running `npm run generate`.

Before changing the `/testsets/` directory, always call `npm run dockerDown`. After modifying the directory this command might fail to take down all currently running containers, and they need to be stopped manually.

## Notes

- Test set directory names should only contain alphanumeric characters, hyphens, and underscores.
- The test runner uses dynamic port allocation to avoid conflicts between test sets.

## Contributing

Contributions to improve the test suite or add new scenarios are welcome. Please submit a pull request with your changes, adhering to the existing code structure and documentation style.

## License

TBD
