import { Injectable, Signal } from '@angular/core';
import { TreeNodeTemplateDirective } from '../directives/tree-node-template.directive';
import { TreeNodeDetailsTemplateDirective } from '../directives/tree-node-details-template.directive';
import { TreeNodeNameTemplateDirective } from '../directives/tree-node-name-template.directive';

@Injectable()
export abstract class TreeNodeTemplateContainerService {
  abstract readonly treeNodeTemplate: Signal<TreeNodeTemplateDirective | undefined>;
  abstract readonly treeNodeNameTemplate: Signal<TreeNodeNameTemplateDirective | undefined>;
  abstract readonly treeNodeDetailsTemplate: Signal<TreeNodeDetailsTemplateDirective | undefined>;
}
