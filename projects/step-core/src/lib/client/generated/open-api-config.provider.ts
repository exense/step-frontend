import { Provider } from '@angular/core';
import type { OpenAPIConfig } from './core/OpenAPI';
import { OpenAPI } from './core/OpenAPI';

export const OPEN_API_CONFIG_PROVIDER: Provider = {
  provide: OpenAPI,
  useValue: {
    BASE: OpenAPI?.BASE ?? '/rest',
    VERSION: OpenAPI?.VERSION ?? '3.27.2',
    WITH_CREDENTIALS: OpenAPI?.WITH_CREDENTIALS ?? false,
    CREDENTIALS: OpenAPI?.CREDENTIALS ?? 'include',
    TOKEN: OpenAPI?.TOKEN,
    USERNAME: OpenAPI?.USERNAME,
    PASSWORD: OpenAPI?.PASSWORD,
    HEADERS: OpenAPI?.HEADERS,
    ENCODE_PATH: OpenAPI?.ENCODE_PATH,
  } as OpenAPIConfig,
};
