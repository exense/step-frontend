import { FormBuilder, Validators } from '@angular/forms';
import { DynamicValueString, Resource, dynamicValueFactory } from '@exense/step-core';
import { PredefinedResourceType } from './predefined-resource-type.enum';

export type ResourceConfigurationDialogForm = ReturnType<typeof resourceConfigurationDialogFormCreate>;

const { createDynamicValueString } = dynamicValueFactory();

export const resourceConfigurationDialogFormCreate = (formBuilder: FormBuilder) => {
  const { nonNullable } = formBuilder;

  return nonNullable.group({
    name: nonNullable.control<string>('', []),
    resourceType: nonNullable.control<string>(PredefinedResourceType.ATTACHMENT, [Validators.required]),
    content: nonNullable.control<DynamicValueString>(createDynamicValueString(), []),
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
  }

  if (resourceType) {
    form.patchValue({
      resourceType,
    });
  }
};

export const resourceConfigurationDialogFormSetValueToModel = (
  form: ResourceConfigurationDialogForm,
  model: Resource
): void => {
  const { resourceType } = form.getRawValue();

  model.resourceType = resourceType!;
};
