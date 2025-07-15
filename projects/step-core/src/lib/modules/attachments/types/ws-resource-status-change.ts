import { StreamingAttachmentMeta } from '../../../client/step-client-module';

export interface WsResourceStatusChange {
  '@': 'StatusChange';
  resourceStatus: {
    transferStatus: Required<StreamingAttachmentMeta>['status'];
    currentSize: number;
  };
}
