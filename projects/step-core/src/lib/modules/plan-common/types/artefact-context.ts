import { AbstractArtefact } from '../../../client/generated';
import { Observable } from 'rxjs';

export abstract class ArtefactContext<T extends AbstractArtefact = AbstractArtefact> {
  abstract artefact?: T;
  abstract readonly artefactChange$: Observable<void>;
  abstract readonly: boolean;
  abstract save(): void;
}
