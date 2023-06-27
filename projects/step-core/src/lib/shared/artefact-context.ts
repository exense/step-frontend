import { AbstractArtefact } from '../client/generated';

export abstract class ArtefactContext<T extends AbstractArtefact = AbstractArtefact> {
  abstract artefact?: T;
  abstract readonly: boolean;
  abstract save(): void;
}
