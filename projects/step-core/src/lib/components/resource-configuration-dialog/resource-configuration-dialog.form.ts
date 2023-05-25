import { FormBuilder, Validators } from '@angular/forms';
import { DynamicValueString, Resource } from '../../client/generated';
import { dynamicValueFactory } from '../../shared/utils';
import { PredefinedResourceType } from './predefined-resource-type.enum';

export type ResourceConfigurationDialogForm = ReturnType<typeof resourceConfigurationDialogFormCreate>;

const { createDynamicValueString } = dynamicValueFactory();

export const resourceConfigurationDialogFormCreate = (formBuilder: FormBuilder) => {
  return formBuilder.nonNullable.group({
    name: formBuilder.nonNullable.control<string>('', []),
    resourceType: formBuilder.nonNullable.control<string>(PredefinedResourceType.ATTACHMENT, [Validators.required]),
    content: formBuilder.nonNullable.control<DynamicValueString>(createDynamicValueString(), []),
  });
};

export const resourceConfigurationDialogFormSetValueToForm = (
  form: ResourceConfigurationDialogForm,
  model: Resource
): void => {
  const { attributes, resourceType } = model;

  if (attributes?.['name']) {
    form.patchValue({
      name: attributes['name'],
      content: createDynamicValueString({
        value: attributes['name'],
      }),
    });
    form.controls.name.disable();
  }

  if (resourceType) {
    form.patchValue({
      resourceType,
    });
    form.controls.resourceType.disable();
  }
};

export const resourceConfigurationDialogFormSetValueToModel = (
  form: ResourceConfigurationDialogForm,
  model: Resource
): void => {
  const { resourceType } = form.getRawValue();

  model.resourceType = resourceType!;
};
