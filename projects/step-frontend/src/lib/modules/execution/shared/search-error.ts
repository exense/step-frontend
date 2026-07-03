export enum SearchErrorType {
  TREE,
  TEST_CASE,
  KEYWORD,
}

export interface SearchError {
  type: SearchErrorType;
  value: string;
}
