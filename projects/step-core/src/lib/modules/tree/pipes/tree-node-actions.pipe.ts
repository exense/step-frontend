import { Optional, Pipe, PipeTransform } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TreeAction } from '../shared/tree-action';
import { AbstractArtefact } from '../../../client/generated';
import { TreeActionsService } from '../services/tree-actions.service';

@Pipe({
  name: 'treeNodeActions',
})
export class TreeNodeActionsPipe implements PipeTransform {
  constructor(@Optional() private treeActions?: TreeActionsService) {}

  transform(node: AbstractArtefact): Observable<TreeAction[]> {
    return !this.treeActions ? of([]) : this.treeActions.getActionsForNode(node);
  }
}
