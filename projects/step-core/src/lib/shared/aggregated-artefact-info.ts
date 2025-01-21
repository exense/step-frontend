import { AbstractArtefact } from '../client/step-client-module';

export interface AggregatedArtefactInfo<T extends AbstractArtefact> {
  originalArtefact?: T;
  countByStatus?: Record<string, number>;
}
