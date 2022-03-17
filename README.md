# StepFrontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.0.4.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build OSS

1. Invoke the command `npm run build:core` it will assemble the library and put the result to the dist/step-core folder
2. In the dist/step-core folder invoke the command `npm pack` it will create a tat.gz archive with library contents.
3. Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Build OSS

Then this archive can be copied manually to step-enterprise-frontend and setup as npm dependency in package.json like:
"@exense/step-core": "./exense-step-core-0.0.1.tgz"
npm install command will unpcak the archive and put it to the node_modules

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
