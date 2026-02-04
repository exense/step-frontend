import { AttachmentMeta } from '../../../client/step-client-module';

export interface AttachmentMetaWithExplicitWidth extends AttachmentMeta {
  explicitWidth?: number;
}
