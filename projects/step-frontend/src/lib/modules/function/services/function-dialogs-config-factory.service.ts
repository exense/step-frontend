import { Injectable } from '@angular/core';
import { FunctionDialogsConfig } from '../types/function-dialogs-config.interface';

@Injectable({
  providedIn: 'root',
})
export class FunctionDialogsConfigFactoryService {
  getDefaultConfig(): FunctionDialogsConfig {
    return this.getConfigObject('Keyword', 'functions', [], false, 'functionTable');
  }

  getConfigObject(
    title: string,
    serviceRoot: string,
    functionTypeFilters: string[],
    lightForm: boolean,
    customScreenTable: string
  ): FunctionDialogsConfig {
    return {
      title,
      serviceRoot,
      functionTypeFilters,
      lightForm,
      customScreenTable,
    };
  }
}
