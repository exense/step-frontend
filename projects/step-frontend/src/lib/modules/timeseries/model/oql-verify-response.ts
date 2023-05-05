export interface OqlVerifyResponse {
  valid: boolean;
  hasUnknownFields: boolean;
  fields: string[];
}
