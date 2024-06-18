import { JsonSchemaFieldType } from './json-schema-field-type.enum';

export interface JsonFieldSchemaMeta {
  name: string;
  type: JsonSchemaFieldType;
  isRequired?: boolean;
  defaultValue?: unknown;
  enumItems?: string[];
}
