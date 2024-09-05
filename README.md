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
- [npm](https://www.npmjs.com/get-npm) or [Yarn](https://yarnpkg.com/getting-started/install)

## Running tests

1. Install dependencies:

   ```bash
   npm ci
   ```

2. Run tests:

   ```bash
   npm test
   ```

   This command will start up the Docker containers, execute all defined tests, and then shut down the containers.

## Configuration

Modify the `database_config.yaml`, `reference_genomes.json`, and any other configuration files in the `testsets` directory according to your test requirements.

## Project Structure

- `/testsets/`: Contains individual test sets. Each test set is a directory that includes:
  - `data/`: Input data for the test set
  - `queries/`: Test queries and expected responses
  - `output/`: Output directory for SILO preprocessing
- `docker-compose.yml`: Defines the LAPIS and SILO services
- `test.ts`: Main test script that sets up and runs all test sets
- `vitest.config.ts`: Vitest configuration
- `package.json`: Defines project dependencies and scripts
- `.prettierrc`: Prettier configuration for code formatting

## Adding New Queries

Queries are expected in the `queries/` folder within each testset.

Every query file must end with `.query.json`. A query file has the following structure.

### 1. `name` (String)
- **Description**: A human-readable description of the query, providing context on what the query is intended to do.
- **Example**: `"Query that requests all metadata and sorts it by the primary key"`

### 2. `endpoint` (String)
- **Description**: The API endpoint (URL path) that this query will send a request to.
- **Example**: `"/sample/details"`

### 3. `method` (String)
- **Description**: The HTTP method used for the request, such as `GET`, `POST`, `PUT`, or `DELETE`.
- **Example**: `"POST"`

### 4. `headers` (Object)
- **Description**: A key-value pair object specifying the HTTP headers to be included in the request.
- **Example**:
  ```json
  {"Content-Type": "application/json"}

### 5. `body` (Object)
- **Description**: The request body that contains the data to send along with the query.

### 6. `expectedStatusCode` (Integer, optional)
- **Description**: The expected HTTP status code that should be returned from the request. This is used to verify if the request was successful.
- **Example**:
  ```json
  200
  ```
### 7. `expectedResult` (Object, optional)
- **Description**: The expected HTTP response.
This must be given as an object that contains the `filename`.
Currently, only json is supported, where only the `data` element is compared.
- **Example**:
  ```json
  {"filename":  "testResult.json"}
  ```


## Adding New Test Sets

To add a new test set:

1. Create a new directory under `/testsets/`
2. Add necessary data files to the `data/` subdirectory
3. Create query files in the `queries/` subdirectory
4. Add expected response files if needed

The test runner will automatically detect and run tests for all test sets in the `/testsets/` directory.

## Notes

- Test set directory names should only contain alphanumeric characters, hyphens, and underscores.
- The test runner uses dynamic port allocation to avoid conflicts between test sets.

## Contributing

Contributions to improve the test suite or add new scenarios are welcome. Please submit a pull request with your changes, adhering to the existing code structure and documentation style.

## License

TBD