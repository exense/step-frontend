import { dasherize, camelize } from '@angular-devkit/core/src/utils/strings';
import { Schema } from './schema';

export interface Names {
  readonly pluginName: string;
  readonly folderName: string;
  readonly defaultView: string;
  readonly defaultViewSelector: string;
  readonly nAJSModule: string;
}

export function createNames({ name, prefix }: Pick<Schema, 'name' | 'prefix'>): Names {
  const pluginName = camelize(name);
  const folderName = dasherize(pluginName);
  const nAJSModule = dasherize(`${name}-ajs`);
  const defaultView = dasherize(`${name}-default-view`);
  const defaultViewSelector = dasherize(`${prefix}-${defaultView}`);

  return {
    pluginName,
    folderName,
    defaultView,
    defaultViewSelector,
    nAJSModule,
  };
}
