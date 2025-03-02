# Document Converter

A simple API for converting documents between different formats.

## Supported Formats

| Format  | Content Type          |
| ------- | --------------------- |
| EDI X12 | `application/edi-x12` |
| JSON    | `application/json`    |
| XML     | `application/xml`     |

## Getting Started

### Prerequisites

- Node.js 22.x or later
- npm 10.x or later
- Version manager: [nvm](https://github.com/nvm-sh/nvm) or
  [asdf](https://asdf-vm.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/document-converter.git
cd document-converter

# Using nvm
nvm use && npm install

# Using asdf
asdf install && npm install
```

### Development

```bash
# Run linting
npm run lint

# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Start development server
npm run start:dev
```

## Environment Configuration

| Variable                    | Default       | Description                                          |
| --------------------------- | ------------- | ---------------------------------------------------- |
| `PORT`                      | `3000`        | The port on which the server listens                 |
| `NODE_ENV`                  | `development` | Environment mode (`development`, `production`, etc.) |
| `SENTRY_DSN`                | -             | Sentry Data Source Name for error tracking           |
| `SENTRY_DEBUG`              | `false`       | Enable Sentry debug mode                             |
| `SENTRY_TRACES_SAMPLE_RATE` | `1.0`         | Sampling rate for Sentry performance monitoring      |

### Examples

```bash
# Run on port 8080
PORT=8080 npm run start:dev

# Run in production mode
NODE_ENV=production npm run start:prod
```

## Available Commands

| Command                 | Description                           |
| ----------------------- | ------------------------------------- |
| `npm run build`         | Build the application for production  |
| `npm run format`        | Format code using Prettier            |
| `npm run start`         | Start the application                 |
| `npm run start:dev`     | Start with hot-reload for development |
| `npm run start:debug`   | Start with debugging and hot-reload   |
| `npm run start:prod`    | Run the production build              |
| `npm run clean:dist`    | Remove the dist directory             |
| `npm run clean:modules` | Remove node_modules directory         |
| `npm run clean`         | Remove both dist and node_modules     |
| `npm run lint`          | Run ESLint and fix issues             |
| `npm run test`          | Run unit tests                        |
| `npm run test:watch`    | Run tests in watch mode               |
| `npm run test:cov`      | Run tests with coverage report        |
| `npm run test:e2e`      | Run end-to-end tests                  |

## API Documentation

### Convert Document

```
POST /v1/document/convert
```

#### Request Headers

| Header         | Description                                                                  |
| -------------- | ---------------------------------------------------------------------------- |
| `Content-Type` | Source format (`application/edi-x12`, `application/json`, `application/xml`) |
| `Accept`       | Target format (`application/edi-x12`, `application/json`, `application/xml`) |

#### Query Parameters

| Parameter          | Default | Description                    |
| ------------------ | ------- | ------------------------------ |
| `elementSeparator` | `*`     | Separator for EDI X12 elements |
| `segmentSeparator` | `~`     | Separator for EDI X12 segments |
| `format`           | `true`  | Pretty-print the output        |

## Live API Examples

**Note:** The live API is deployed with autoscaling to 0 instances when idle. It may take a few seconds to warm up when the first request comes in.

### Convert EDI X12 to JSON

```bash
curl -X POST https://document-converter-754471078262.us-central1.run.app/v1/document/convert \
  -H "Content-Type: application/edi-x12" \
  -H "Accept: application/json" \
  -d 'ProductID*4*8*15~AddressID*42*108~'
```

### Convert JSON to XML

```bash
curl -X POST https://document-converter-754471078262.us-central1.run.app/v1/document/convert \
  -H "Content-Type: application/json" \
  -H "Accept: application/xml" \
  -d '{"ProductID":[{"ProductID1":"4","ProductID2":"8", "ProductID3": "15"}], "AddressID":[{"AddressID1":"42","AddressID2":"108"}]}'
```

### Convert JSON to EDI X12 with custom separators

```bash
curl -X POST https://document-converter-754471078262.us-central1.run.app/v1/document/convert?elementSeparator=%2B&segmentSeparator=%26 \
  -H "Content-Type: application/json" \
  -H "Accept: application/edi-x12" \
  -d '{"ProductID":[{"ProductID1":"4","ProductID2":"8", "ProductID3": "15"}], "AddressID":[{"AddressID1":"42","AddressID2":"108"}]}'
```
