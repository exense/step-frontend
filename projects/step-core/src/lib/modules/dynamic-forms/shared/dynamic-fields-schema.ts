export type DynamicFieldProperty = {
  type?: 'string' | 'number' | 'boolean' | 'integer';
  enum?: string[];
  default?: string;
};
export interface DynamicFieldsSchema {
  properties: Record<string, DynamicFieldProperty>;
  required?: string[];
}
