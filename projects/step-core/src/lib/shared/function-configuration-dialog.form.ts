import { KeyValue } from '@angular/common';
import { AbstractControl, FormBuilder, ValidationErrors } from '@angular/forms';
import { DynamicValueInteger, Function as Keyword } from '../client/generated';
import {
  AgentTokenSelectionCriteriaForm,
  agentTokenSelectionCriteriaFormCreate,
} from './agent-token-selection-criteria.form';
import { FunctionConfigurationDialogData } from './function-configuration-dialog-data.interface';
import { FunctionType } from './function-type.enum';
import { dynamicValueFactory, toKeyValuePairs, toRecord } from './utils';

export type FunctionConfigurationDialogForm = ReturnType<typeof functionConfigurationDialogFormCreate>;

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
  schemaEnforced: boolean,
  functionConfigurationDialogData: FunctionConfigurationDialogData
) => {
  const {
    dialogConfig: { functionTypeFilters },
  } = functionConfigurationDialogData;
  const [functionTypeFilter] = functionTypeFilters;
  const { createDynamicValueInteger } = dynamicValueFactory();
  const formGroup = formBuilder.nonNullable.group({
    attributes: formBuilder.nonNullable.control<Record<string, string>>({ name: '' }, []),
    description: formBuilder.nonNullable.control<string>('', []),
    schema: formBuilder.nonNullable.control<string>(DEFAULT_SCHEMA_VALUE, [
      ...(!lightForm && schemaEnforced ? [schemaValidator] : []),
    ]),
    type: formBuilder.nonNullable.control<string>(
      functionTypeFilters.length ? functionTypeFilter : FunctionType.SCRIPT,
      []
    ),
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
  model: Keyword,
  formBuilder: FormBuilder
): void => {
  const { attributes, description, schema, type, callTimeout, executeLocally, tokenSelectionCriteria } = model;

  form.patchValue({
    attributes,
    description,
    schema: schema ? JSON.stringify(schema) : DEFAULT_SCHEMA_VALUE,
    type,
    callTimeout,
    executeLocally,
  });

  const tokens = toKeyValuePairs(tokenSelectionCriteria ?? {});
  if (form.controls.tokenSelectionCriteria.length !== tokens.length) {
    form.controls.tokenSelectionCriteria.clear({ emitEvent: false });
    for (let i = 0; i < tokens.length; i++) {
      form.controls.tokenSelectionCriteria.push(agentTokenSelectionCriteriaFormCreate(formBuilder), {
        emitEvent: false,
      });
    }
  }

  if (tokens.length > 0) {
    form.patchValue({ tokenSelectionCriteria: tokens });
  }
};

export const functionConfigurationDialogFormSetValueToModel = (
  form: FunctionConfigurationDialogForm,
  model: Keyword
): void => {
  const { attributes, description, schema, type, callTimeout, executeLocally, tokenSelectionCriteria } = form.value;

  model.attributes = {
    ...model.attributes,
    ...attributes,
  };
  model.description = description;
  model.schema = schema ? JSON.parse(schema) : {};
  model.type = type!;
  model.callTimeout = callTimeout!;
  model.executeLocally = executeLocally!;
  model.tokenSelectionCriteria = tokenSelectionCriteria
    ? toRecord(tokenSelectionCriteria as KeyValue<string, string>[])
    : {};
};
