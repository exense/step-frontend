import { Observable } from 'rxjs';
import { Function as Keyword } from '../../../client/step-client-module';
import { FunctionConfigurationDialogForm } from './function-configuration-dialog.form';

export interface FunctionTypeFormComponentContext {
  formGroup: FunctionConfigurationDialogForm;
  keyword: Keyword;
  setValueToForm$: Observable<void>;
  setValueToModel$: Observable<void>;
}
