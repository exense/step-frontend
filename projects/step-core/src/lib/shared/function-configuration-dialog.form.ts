import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { dynamicValueFactory, DynamicValueInteger, KeyValuePair, toKeyValuePairs, toRecord } from '@exense/step-core';
import { Function } from '../client/generated';
import { AgentTokenSelectionCriteriaForm } from './agent-token-selection-criteria.form';
import { FunctionType } from './function-type.enum';

export type FunctionConfigurationDialogForm = ReturnType<typeof functionConfigurationDialogFormCreate>;

export const nameValidator = (attributesControl: AbstractControl<Record<string, string>>): ValidationErrors | null => {
  const attributes = attributesControl.value;

  if (!attributes) {
    return {
      required: true,
    };
  }

  if (!attributes['name']) {
    return {
      required: true,
    };
  }

  return null;
};

export const schemaValidator = (schemaControl: AbstractControl<string>): ValidationErrors | null => {
  const schema = schemaControl.value;

  if (!schema) {
    return {
      required: true,
    };
  }

  let schemaFormatValid = true;

  try {
    JSON.parse(schema);
  } catch (error) {
    schemaFormatValid = false;
  }

  if (!schemaFormatValid) {
    return {
      format: true,
    };
  }

  return null;
};

const DEFAULT_SCHEMA_VALUE = '{}';
const DEFAULT_CALL_TIMEOUT_MS = 180000;

export const functionConfigurationDialogFormCreate = (
  formBuilder: FormBuilder,
  lightForm: boolean,
  schemaEnforced: boolean
) => {
  const { createDynamicValueInteger } = dynamicValueFactory();
  const formGroup = formBuilder.nonNullable.group({
    attributes: formBuilder.nonNullable.control<Record<string, string>>({ name: '' }, [nameValidator]),
    description: formBuilder.nonNullable.control<string>('', []),
    schema: formBuilder.nonNullable.control<string>(DEFAULT_SCHEMA_VALUE, [
      ...(!lightForm && schemaEnforced ? [schemaValidator] : []),
    ]),
    htmlTemplate: formBuilder.nonNullable.control<string>('', []),
    type: formBuilder.nonNullable.control<string>(FunctionType.SCRIPT, [Validators.required]),
    callTimeout: formBuilder.nonNullable.control<DynamicValueInteger>(
      createDynamicValueInteger({ value: DEFAULT_CALL_TIMEOUT_MS }),
      []
    ),
    executeLocally: formBuilder.nonNullable.control<boolean>(false, []),
    tokenSelectionCriteria: formBuilder.nonNullable.array<AgentTokenSelectionCriteriaForm>([], []),
  });

  return formGroup;
};

export const functionConfigurationDialogFormSetValueToForm = (
  form: FunctionConfigurationDialogForm,
  model: Function
): void => {
  const { attributes, description, schema, htmlTemplate, type, callTimeout, executeLocally, tokenSelectionCriteria } =
    model;

  form.patchValue({
    attributes,
    description,
    schema: schema ? JSON.stringify(schema) : DEFAULT_SCHEMA_VALUE,
    htmlTemplate,
    type,
    callTimeout,
    executeLocally,
    tokenSelectionCriteria: tokenSelectionCriteria ? toKeyValuePairs(tokenSelectionCriteria) : [],
  });
};

export const functionConfigurationDialogFormSetValueToModel = (
  form: FunctionConfigurationDialogForm,
  model: Function
): void => {
  const { attributes, description, schema, htmlTemplate, type, callTimeout, executeLocally, tokenSelectionCriteria } =
    form.value;

  model.attributes = {
    ...model.attributes,
    ...attributes,
  };
  model.description = description;
  model.schema = schema ? JSON.parse(schema) : {};
  model.htmlTemplate = htmlTemplate;
  model.type = type!;
  model.callTimeout = callTimeout!;
  model.executeLocally = executeLocally!;
  model.tokenSelectionCriteria = tokenSelectionCriteria
    ? toRecord(tokenSelectionCriteria as KeyValuePair<string, string>[])
    : {};
};
