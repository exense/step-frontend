import { FieldSchemaType } from './field-schema-type.enum';

export interface FieldSchemaMeta {
  name: string;
  type: FieldSchemaType;
  isRequired?: boolean;
  defaultValue?: unknown;
  enumItems?: string[];
}
