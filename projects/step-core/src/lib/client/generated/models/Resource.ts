/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Resource = {
  customFields?: Record<string, any>;
  attributes?: Record<string, string>;
  creationDate?: string;
  creationUser?: string;
  lastModificationDate?: string;
  lastModificationUser?: string;
  currentRevisionId?: string;
  resourceType?: string;
  resourceName?: string;
  directory?: boolean;
  ephemeral?: boolean;
  origin?: string;
  originTimestamp?: number;
  id?: string;
};
