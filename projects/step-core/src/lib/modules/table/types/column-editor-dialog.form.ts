import { FormArray, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Input as SInput, Option as SOption, Option } from '../../../client/step-client-module';
import { v4 } from 'uuid';

export const optionFormId = Symbol('Option Form Id');
export type OptionForm = ReturnType<typeof optionFormCreate>;
export type SInputForm = ReturnType<typeof inputFormCreate>;
export type OptionFormArray = SInputForm['controls']['options'];

export const optionFormCreate = (fb: NonNullableFormBuilder, option?: Option) => {
  const result = fb.group({
    value: fb.control(option?.value ?? ''),
    activationExpression: fb.control(option?.activationExpression ?? { script: '' }),
  });
  (result as any)[optionFormId] = v4();
  return result;
};

export const inputFormCreate = (fb: NonNullableFormBuilder, input?: SInput) =>
  fb.group({
    id: fb.control(input?.id ?? '', [Validators.required]),
    label: fb.control(input?.label ?? '', [Validators.required]),
    description: fb.control(input?.description ?? ''),
    type: fb.control(input?.type ?? 'TEXT'),
    options: fb.array((input?.options ?? []).map((opt) => optionFormCreate(fb, opt))),
    defaultValue: fb.control(input?.defaultValue ?? ''),
    activationExpression: fb.control(input?.activationExpression),
    customUIComponents: fb.control(input?.customUIComponents),
    searchMapperService: fb.control(input?.searchMapperService),
  });
