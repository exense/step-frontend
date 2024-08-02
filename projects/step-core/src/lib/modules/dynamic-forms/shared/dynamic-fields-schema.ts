export type SchemaObjectField = {
  type: 'object';
  properties: Record<string, SchemaField>;
  required?: string[];
  default?: any;
};

export type SchemaArrayField = {
  type: 'array';
  items?: SchemaField;
  default?: any;
};

export type SchemaSimpleField = {
  type?: 'string' | 'number' | 'boolean' | 'integer';
  enum?: string[];
  default?: any;
};

export type SchemaField = SchemaSimpleField | SchemaArrayField | SchemaObjectField;

export type DynamicFieldsSchema = Pick<SchemaObjectField, 'properties' | 'required'>;
