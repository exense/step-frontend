import { inject } from '@angular/core';

export const INJECTOR = '$injector';

export function ajsProviderFactory<T = any>(providerName: string): () => T {
  return () => {
    //@ts-ignore
    const $injector: any = inject(INJECTOR);
    return $injector.get(providerName);
  };
}

export const angularJsProviderOptions = (providerName: string) => ({
  providerIn: 'root',
  factory: ajsProviderFactory(providerName),
});
