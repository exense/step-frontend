export type DynamicFieldProperty = {
  type?: 'string' | 'number' | 'boolean' | 'integer' | 'array' | 'object';
  enum?: string[];
  default?: any;
};
export interface DynamicFieldsSchema {
  properties: Record<string, DynamicFieldProperty>;
  required?: string[];
}
