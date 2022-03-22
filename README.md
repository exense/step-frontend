# step Frontend (step FE)

step FE is part of step and requires step BE (https://github.com/exense/step) in order to be used. Learn more about step in our official documentation on https://step.exense.ch/knowledgebase

For support, our enterprise version or our no-maintenance-required SaaS solution check out our website: http://step.exense.ch

## Development server

Run `npm run start:local` to build and serve step FE & step FE CORE. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Connecting to step BE

Start step BE on your local machine, with the start:local configuration the FE will map BE requests to port 8080

## Build step

Invoke the command `npm run build` it will assemble the core library and step FE

## Export step:core

After building, run `npm pack` in the dist/step-core folder, it will create a tat.gz archive with library contents.

Then this archive can be copied manually to step-enterprise-frontend and setup as npm dependency in package.json like:
"@exense/step-core": "./exense-step-core-0.0.1.tgz"

npm install command will unpack the archive and put it to the node_modules
