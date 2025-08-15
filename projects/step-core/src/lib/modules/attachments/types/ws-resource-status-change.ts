import { StreamingAttachmentMeta } from '../../../client/step-client-module';

export interface WsResourceStatusChange {
  '@': 'StatusChanged';
  resourceStatus: {
    transferStatus: Required<StreamingAttachmentMeta>['status'];
    numberOfLines: number;
    currentSize: number;
  };
}
