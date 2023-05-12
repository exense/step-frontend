import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { dynamicValueFactory, DynamicValueInteger, KeyValuePair, toKeyValuePairs, toRecord } from '@exense/step-core';
import { Subject, takeUntil } from 'rxjs';
import { AgentTokenSelectionCriterionForm } from './agent-token-selection-criterion.form';
import { FunctionAstra } from './function-astra.interface';
import { FunctionComposite } from './function-composite.interface';
import { FunctionCucumber } from './function-cucumber.interface';
import { FunctionCypress } from './function-cypress.interface';
import { FunctionDotnet } from './function-dotnet.interface';
import { FunctionImageCompare } from './function-image-compare.interface';
import { FunctionJMeter } from './function-jmeter.interface';
import { FunctionNodeJS } from './function-node-js.interface';
import { FunctionOryon } from './function-oryon.interface';
import { FunctionPDFTest } from './function-pdf-test.interface';
import { FunctionQFTest } from './function-qftest.interface';
import { FunctionScript } from './function-script.interface';
import { FunctionSikulix } from './function-sikulix.interface';
import { FunctionSoapUI } from './function-soap-ui.interface';
import {
  functionTypeAstraFormCreate,
  functionTypeAstraFormSetValueToForm,
  functionTypeAstraFormSetValueToModel,
} from './function-type-astra.form';
import {
  functionTypeCompositeFormCreate,
  functionTypeCompositeFormSetValueToForm,
  functionTypeCompositeFormSetValueToModel,
} from './function-type-composite.form';
import {
  functionTypeCucumberFormCreate,
  functionTypeCucumberFormSetValueToForm,
  functionTypeCucumberFormSetValueToModel,
} from './function-type-cucumber.form';
import {
  functionTypeCypressFormCreate,
  functionTypeCypressFormSetValueToForm,
  functionTypeCypressFormSetValueToModel,
} from './function-type-cypress.form';
import {
  functionTypeDotnetFormCreate,
  functionTypeDotnetFormSetValueToForm,
  functionTypeDotnetFormSetValueToModel,
} from './function-type-dotnet.form';
import {
  functionTypeImageCompareFormCreate,
  functionTypeImageCompareFormSetValueToForm,
  functionTypeImageCompareFormSetValueToModel,
} from './function-type-image-compare.form';
import {
  functionTypeJMeterFormCreate,
  functionTypeJMeterFormSetValueToForm,
  functionTypeJMeterFormSetValueToModel,
} from './function-type-jmeter.form';
import {
  functionTypeNodeJSFormCreate,
  functionTypeNodeJSFormSetValueToForm,
  functionTypeNodeJSFormSetValueToModel,
} from './function-type-node-js.form';
import {
  functionTypeOryonFormCreate,
  functionTypeOryonFormSetValueToForm,
  functionTypeOryonFormSetValueToModel,
} from './function-type-oryon.form';
import {
  functionTypePDFTestFormCreate,
  functionTypePDFTestFormSetValueToForm,
  functionTypePDFTestFormSetValueToModel,
} from './function-type-pdf-test.form';
import {
  functionTypeQFTestFormCreate,
  functionTypeQFTestFormSetValueToForm,
  functionTypeQFTestFormSetValueToModel,
} from './function-type-qf-test.form';
import {
  functionTypeScriptFormCreate,
  functionTypeScriptFormSetValueToForm,
  functionTypeScriptFormSetValueToModel,
} from './function-type-script.form';
import {
  functionTypeSikulixFormCreate,
  functionTypeSikulixFormSetValueToForm,
  functionTypeSikulixFormSetValueToModel,
} from './function-type-sikulix.form';
import {
  functionTypeSoapUIFormCreate,
  functionTypeSoapUIFormSetValueToForm,
  functionTypeSoapUIFormSetValueToModel,
} from './function-type-soap-ui.form';
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
  schemaEnforced: boolean,
  terminator$: Subject<void>
) => {
  const { createDynamicValueInteger } = dynamicValueFactory();
  const formGroup = formBuilder.nonNullable.group({
    attributes: formBuilder.nonNullable.control<Record<string, string>>({ name: '' }, [nameValidator]),
    description: formBuilder.nonNullable.control<string>('', []),
    schema: formBuilder.nonNullable.control<string>(DEFAULT_SCHEMA_VALUE, [
      ...(!lightForm && schemaEnforced ? [schemaValidator] : []),
    ]),
    htmlTemplate: formBuilder.nonNullable.control<string>('', []),
    type: formBuilder.nonNullable.control<FunctionType>(FunctionType.SCRIPT, [Validators.required]),
    callTimeout: formBuilder.nonNullable.control<DynamicValueInteger>(
      createDynamicValueInteger({ value: DEFAULT_CALL_TIMEOUT_MS }),
      []
    ),
    executeLocally: formBuilder.nonNullable.control<boolean>(false, []),
    tokenSelectionCriteria: formBuilder.nonNullable.array<AgentTokenSelectionCriterionForm>([], []),
    composite: functionTypeCompositeFormCreate(formBuilder),
    qfTest: functionTypeQFTestFormCreate(formBuilder),
    script: functionTypeScriptFormCreate(formBuilder),
    dotnet: functionTypeDotnetFormCreate(formBuilder),
    astra: functionTypeAstraFormCreate(formBuilder),
    jmeter: functionTypeJMeterFormCreate(formBuilder),
    cypress: functionTypeCypressFormCreate(formBuilder),
    oryon: functionTypeOryonFormCreate(formBuilder),
    soapUI: functionTypeSoapUIFormCreate(formBuilder),
    nodeJS: functionTypeNodeJSFormCreate(formBuilder),
    pdfTest: functionTypePDFTestFormCreate(formBuilder),
    imageCompare: functionTypeImageCompareFormCreate(formBuilder),
    cucumber: functionTypeCucumberFormCreate(formBuilder),
    sikulix: functionTypeSikulixFormCreate(formBuilder),
  });

  formGroup.controls.type.valueChanges.pipe(takeUntil(terminator$)).subscribe(() => {
    formGroup.controls.composite.reset();
    formGroup.controls.qfTest.reset();
    formGroup.controls.script.reset();
    formGroup.controls.dotnet.reset();
    formGroup.controls.astra.reset();
    formGroup.controls.jmeter.reset();
    formGroup.controls.cypress.reset();
    formGroup.controls.oryon.reset();
    formGroup.controls.soapUI.reset();
    formGroup.controls.nodeJS.reset();
    formGroup.controls.pdfTest.reset();
    formGroup.controls.imageCompare.reset();
    formGroup.controls.cucumber.reset();
    formGroup.controls.sikulix.reset();
  });

  return formGroup;
};

export type ConcreteFunction =
  | FunctionComposite
  | FunctionQFTest
  | FunctionScript
  | FunctionDotnet
  | FunctionAstra
  | FunctionJMeter
  | FunctionCypress
  | FunctionOryon
  | FunctionSoapUI
  | FunctionNodeJS
  | FunctionPDFTest
  | FunctionImageCompare
  | FunctionCucumber
  | FunctionSikulix;

export const functionConfigurationDialogFormSetValueToForm = (
  form: FunctionConfigurationDialogForm,
  model: ConcreteFunction
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

  switch (model.type) {
    case FunctionType.COMPOSITE:
      functionTypeCompositeFormSetValueToForm(form.controls.composite, model);
      break;
    case FunctionType.QF_TEST:
      functionTypeQFTestFormSetValueToForm(form.controls.qfTest, model);
      break;
    case FunctionType.SCRIPT:
      functionTypeScriptFormSetValueToForm(form.controls.script, model);
      break;
    case FunctionType.DOTNET:
      functionTypeDotnetFormSetValueToForm(form.controls.dotnet, model);
      break;
    case FunctionType.ASTRA:
      functionTypeAstraFormSetValueToForm(form.controls.astra, model);
      break;
    case FunctionType.JMETER:
      functionTypeJMeterFormSetValueToForm(form.controls.jmeter, model);
      break;
    case FunctionType.CYPRESS:
      functionTypeCypressFormSetValueToForm(form.controls.cypress, model);
      break;
    case FunctionType.ORYON:
      functionTypeOryonFormSetValueToForm(form.controls.oryon, model);
      break;
    case FunctionType.SOAP_UI:
      functionTypeSoapUIFormSetValueToForm(form.controls.soapUI, model);
      break;
    case FunctionType.NODE_JS:
      functionTypeNodeJSFormSetValueToForm(form.controls.nodeJS, model);
      break;
    case FunctionType.PDF_TEST:
      functionTypePDFTestFormSetValueToForm(form.controls.pdfTest, model);
      break;
    case FunctionType.IMAGE_COMPARE:
      functionTypeImageCompareFormSetValueToForm(form.controls.imageCompare, model);
      break;
    case FunctionType.CUCUMBER:
      functionTypeCucumberFormSetValueToForm(form.controls.cucumber, model);
      break;
    case FunctionType.SIKULIX:
      functionTypeSikulixFormSetValueToForm(form.controls.sikulix, model);
      break;
  }
};

export const functionConfigurationDialogFormSetValueToModel = (
  form: FunctionConfigurationDialogForm,
  model: ConcreteFunction
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

  switch (model.type) {
    case FunctionType.COMPOSITE:
      functionTypeCompositeFormSetValueToModel(form.controls.composite, model);
      break;
    case FunctionType.QF_TEST:
      functionTypeQFTestFormSetValueToModel(form.controls.qfTest, model);
      break;
    case FunctionType.SCRIPT:
      functionTypeScriptFormSetValueToModel(form.controls.script, model);
      break;
    case FunctionType.DOTNET:
      functionTypeDotnetFormSetValueToModel(form.controls.dotnet, model);
      break;
    case FunctionType.ASTRA:
      functionTypeAstraFormSetValueToModel(form.controls.astra, model);
      break;
    case FunctionType.JMETER:
      functionTypeJMeterFormSetValueToModel(form.controls.jmeter, model);
      break;
    case FunctionType.CYPRESS:
      functionTypeCypressFormSetValueToModel(form.controls.cypress, model);
      break;
    case FunctionType.ORYON:
      functionTypeOryonFormSetValueToModel(form.controls.oryon, model);
      break;
    case FunctionType.SOAP_UI:
      functionTypeSoapUIFormSetValueToModel(form.controls.soapUI, model);
      break;
    case FunctionType.NODE_JS:
      functionTypeNodeJSFormSetValueToModel(form.controls.nodeJS, model);
      break;
    case FunctionType.PDF_TEST:
      functionTypePDFTestFormSetValueToModel(form.controls.pdfTest, model);
      break;
    case FunctionType.IMAGE_COMPARE:
      functionTypeImageCompareFormSetValueToModel(form.controls.imageCompare, model);
      break;
    case FunctionType.CUCUMBER:
      functionTypeCucumberFormSetValueToModel(form.controls.cucumber, model);
      break;
    case FunctionType.SIKULIX:
      functionTypeSikulixFormSetValueToModel(form.controls.sikulix, model);
      break;
  }
};
