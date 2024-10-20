# Step Frontend (Step FE)

Step FE is part of Step and requires Step BE (https://github.com/exense/step) in order to be used.

Learn more about Step in our official documentation on https://step.dev/knowledgebase or download the full Step distribution at [step-distribution/releases](https://github.com/exense/step-distribution/releases)

For support, our enterprise version or our no-maintenance-required SaaS solution check out our website: http://step.dev

## Install dependencies

Run `npm install` to install all necessary dependencies.

## Development server

Run `npm run start:local` to build and serve step FE & step FE CORE. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Connecting to Step BE

Start step BE on your local machine, with the start:local configuration the FE will map BE requests to port 8080

## Build Step

Invoke the command `npm run build` it will assemble the core library and step FE

## Generate OpenAPI classes with a local backend

`node generate-openapi-client.js http://localhost:8080/rest/private-openapi.json`
