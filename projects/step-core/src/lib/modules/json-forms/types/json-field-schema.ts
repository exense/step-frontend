export type SchemaObjectField = {
  type: 'object';
  properties: Record<string, SchemaField>;
  description?: string;
  required?: string[];
  default?: any;
};

export type SchemaArrayField = {
  type: 'array';
  items?: SchemaField;
  description?: string;
  default?: any;
};

export type SchemaSimpleField = {
  type?: 'string' | 'number' | 'boolean' | 'integer';
  enum?: string[];
  description?: string;
  default?: any;
};

export type SchemaField = SchemaSimpleField | SchemaObjectField | SchemaArrayField;

export type JsonFieldsSchema = Pick<SchemaObjectField, 'properties' | 'required'>;
