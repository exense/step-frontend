import { Type } from '@angular/core';

const hybridModuleNameField = '__hybridModuleName__';

export interface PluginModuleMetaInfo {
  hybridModuleName?: string;
}

export const getPluginMetaInfo = <T>(classType: Type<T>): PluginModuleMetaInfo => {
  const hybridModuleName: string = (classType as any)[hybridModuleNameField] || undefined;
  return { hybridModuleName };
};

export function Plugin(hybridModuleName?: string) {
  return function decorator<T>(classType: Type<T>) {
    if (hybridModuleName) {
      (classType as any)[hybridModuleNameField] = hybridModuleName;
    }
  };
}
