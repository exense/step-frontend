import { AbstractArtefact } from '../../../client/step-client-module';

export abstract class PlanArtefactResolverService {
  abstract openArtefact(node?: AbstractArtefact): void;
}
