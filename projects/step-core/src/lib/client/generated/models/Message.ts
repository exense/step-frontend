/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Message = {
  customFields?: Record<string, any>;
  importance?: 'LOW' | 'NORMAL' | 'HIGH' | 'HIGHEST';
  subject?: string;
  body?: string;
  category?: string;
  subcategory?: string;
  topicKey?: string;
  sticky?: boolean;
  timestamp?: number;
  userStates?: Record<string, 'DISMISSED' | 'READ' | 'UNREAD'>;
  id?: string;
};
