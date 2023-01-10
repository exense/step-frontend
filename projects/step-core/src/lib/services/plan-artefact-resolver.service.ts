import { AbstractArtefact } from '../client/generated';

export abstract class PlanArtefactResolverService {
  abstract openArtefact(node?: AbstractArtefact): void;
}
