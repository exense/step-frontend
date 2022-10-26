import { AbstractArtefact } from '../../../client/generated';
import { Observable } from 'rxjs';
import { TreeAction } from '../shared/tree-action';

export abstract class TreeActionsService {
  abstract getActionsForNode(node: AbstractArtefact): Observable<TreeAction[]>;
  abstract hasActionsForNode(node: AbstractArtefact): boolean;
}
