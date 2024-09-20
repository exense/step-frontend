export interface JsonFieldProperty {
  type?: 'string' | 'number' | 'boolean' | 'integer' | 'array' | 'object';
  enum?: string[];
  default?: any;
}

export interface JsonFieldSchema {
  properties: Record<string, JsonFieldProperty>;
  required?: string[];
}
