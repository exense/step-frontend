import { FunctionConfigurationDialogForm } from '../types/function-configuration-dialog.form';
import { Keyword } from '../../../client/step-client-module';

export abstract class FunctionTypeParentFormService {
  abstract readonly formGroup?: FunctionConfigurationDialogForm;
  abstract readonly keyword?: Keyword;
}
