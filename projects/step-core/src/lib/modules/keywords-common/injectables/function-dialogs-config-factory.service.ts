import { Injectable } from '@angular/core';
import { FunctionDialogsConfig } from '../types/function-dialogs-config.interface';

@Injectable({
  providedIn: 'root',
})
export class FunctionDialogsConfigFactoryService {
  getDefaultConfig(): FunctionDialogsConfig {
    return this.getConfigObject('Keyword', [], false, 'keyword');
  }

  getConfigObject(
    title: string,
    functionTypeFilters: string[],
    lightForm: boolean,
    customScreenTable: string,
  ): FunctionDialogsConfig {
    return {
      title,
      functionTypeFilters,
      lightForm,
      customScreenTable,
    };
  }
}
