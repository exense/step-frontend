import { AbstractArtefactWithParentId } from './abstract-artefact-with-parent-id';

export interface ArtefactFlatNode extends Pick<AbstractArtefactWithParentId, 'id' | '_class' | 'parentId'> {
  name: string;
  expandable: boolean;
  level: number;
}
