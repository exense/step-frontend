import { AbstractArtefact } from '../client/step-client-module';

export interface AggregatedArtefactInfo {
  originalArtefact: AbstractArtefact;
  countByStatus?: Record<string, number>;
}
