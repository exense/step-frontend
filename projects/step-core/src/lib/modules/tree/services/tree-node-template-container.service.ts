import { Injectable } from '@angular/core';
import { TreeNodeTemplateDirective } from '../directives/tree-node-template.directive';

@Injectable()
export abstract class TreeNodeTemplateContainerService {
  abstract readonly treeNodeTemplate?: TreeNodeTemplateDirective;
}
