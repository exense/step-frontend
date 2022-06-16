/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Expression } from './Expression';
import type { Option } from './Option';

export type Input = {
    id?: string;
    options?: Array<Option>;
    activationExpression?: Expression;
    priority?: number;
    type?: 'TEXT' | 'TEXT_DROPDOWN' | 'DROPDOWN' | 'DATE_RANGE' | 'CHECKBOX' | 'NONE';
    label?: string;
    description?: string;
    valueHtmlTemplate?: string;
    searchMapperService?: string;
    defaultValue?: string;
};

