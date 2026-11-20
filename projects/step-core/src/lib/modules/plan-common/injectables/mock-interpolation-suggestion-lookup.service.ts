import { inject, Injectable } from '@angular/core';
import { map, Observable, timer } from 'rxjs';
import { AbstractArtefact, DynamicValueString } from '../../../client/generated';
import {
  InterpolationSuggestion,
  InterpolationSuggestionLookup,
  InterpolationSuggestionRequest,
} from '../../dynamic-forms/shared/interpolation-suggestions';
import { TreeStateService } from '../../tree';
import { ArtefactNodeSource } from '../types/artefact-node-source.enum';
import { ArtefactTreeNode } from '../types/artefact-tree-node';
import { PlanContext } from '../types/plan-context.interface';
import { PlanEditorService } from './plan-editor.service';

export function getInterpolationPlanId(context?: PlanContext): string | undefined {
  if (!context?.plan) {
    return undefined;
  }
  return context.plan.id || (context.entityType === 'plans' ? context.id : undefined);
}

@Injectable()
export class MockInterpolationSuggestionLookupService implements InterpolationSuggestionLookup {
  private readonly _planEditor = inject(PlanEditorService);
  private readonly _treeState = inject<TreeStateService<AbstractArtefact, ArtefactTreeNode>>(TreeStateService);

  lookup(request: InterpolationSuggestionRequest): Observable<readonly InterpolationSuggestion[]> {
    return timer(100).pipe(map(() => this.getSuggestions(request)));
  }

  private getSuggestions({
    planId,
    nodeId,
    field,
  }: InterpolationSuggestionRequest): readonly InterpolationSuggestion[] {
    const node = this._treeState.findNodeById(nodeId);
    if (!field.trim() || planId !== getInterpolationPlanId(this._planEditor.planContext()) || !node?.originalArtefact) {
      return [];
    }

    const parent = this._treeState.findNodeById(node.parentId);
    const siblings = (parent?.children ?? []) as ArtefactTreeNode[];
    const nodeIndex = siblings.findIndex((sibling) => sibling.id === nodeId);
    const preceding = siblings.slice(0, Math.max(0, nodeIndex));
    const priorArtefacts = preceding.flatMap((sibling) => (sibling.originalArtefact ? [sibling.originalArtefact] : []));
    const suggestions: InterpolationSuggestion[] = [];

    const owner =
      parent?.nodeType === ArtefactNodeSource.AFTER ? this._treeState.findNodeById(parent.parentId) : parent;
    if (owner?.originalArtefact?._class === 'CallKeyword') {
      suggestions.push(
        { expression: 'output.first_product_id', returnType: 'string' },
        { expression: 'output.has_products', returnType: 'boolean' },
      );
    }
    if (priorArtefacts.at(-1)?._class === 'CallKeyword') {
      suggestions.push({ expression: 'previous.first_product_id', returnType: 'string' });
    }

    const variables = new Map<string, InterpolationSuggestion>();
    for (const artefact of priorArtefacts) {
      const variable = this.getSetVariable(artefact);
      if (variable) {
        variables.set(variable.expression, variable);
      }
    }
    return [...suggestions, ...variables.values()];
  }

  private getSetVariable({
    _class,
    key,
    value,
  }: AbstractArtefact & { key?: DynamicValueString; value?: DynamicValueString }): InterpolationSuggestion | undefined {
    const expression = key?.value;
    if (_class !== 'Set' || key?.dynamic || typeof expression !== 'string' || !/^[A-Za-z_]\w*$/.test(expression)) {
      return undefined;
    }

    const returnType = !value?.dynamic && typeof value?.value === 'string' ? 'string' : 'unknown';
    return { expression, returnType };
  }
}
