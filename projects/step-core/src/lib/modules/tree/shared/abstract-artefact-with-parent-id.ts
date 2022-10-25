import { AbstractArtefact } from '../../../client/generated';

export interface AbstractArtefactWithParentId extends AbstractArtefact {
  parentId?: string;
}
