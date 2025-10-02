export enum TypeInfoCategory {
  TEXT,
  IMAGE,
  VIDEO,
  OTHER,
}

export interface TypeInfo {
  readonly mimeType?: string;
  readonly extension?: string;
  readonly category: TypeInfoCategory;
  readonly isCustom?: boolean;
}
