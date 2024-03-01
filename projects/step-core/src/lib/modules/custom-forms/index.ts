import { CustomFormComponent } from './components/custom-form/custom-form.component';
import { StandardCustomFormInputComponent } from './components/custom-form-input/standard-custom-form-input.component';
import { CustomFormWrapperComponent } from './components/custom-form-wrapper/custom-form-wrapper.component';

export * from './components/custom-form/custom-form.component';
export * from './components/custom-form-input/standard-custom-form-input.component';
export * from './components/custom-form-wrapper/custom-form-wrapper.component';

export const CUSTOM_FORMS_COMPONENTS = [
  CustomFormComponent,
  StandardCustomFormInputComponent,
  CustomFormWrapperComponent,
];
