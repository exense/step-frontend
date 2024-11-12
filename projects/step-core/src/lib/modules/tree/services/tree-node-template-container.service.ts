import { Injectable, Signal } from '@angular/core';
import { TreeNodeTemplateDirective } from '../directives/tree-node-template.directive';
import { TreeNodeDetailsTemplateDirective } from '../directives/tree-node-details-template.directive';

@Injectable()
export abstract class TreeNodeTemplateContainerService {
  abstract readonly treeNodeTemplate: Signal<TreeNodeTemplateDirective | undefined>;
  abstract readonly treeNodeDetailsTemplate: Signal<TreeNodeDetailsTemplateDirective | undefined>;
}
