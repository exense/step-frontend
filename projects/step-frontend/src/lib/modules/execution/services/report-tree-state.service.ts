import { Injectable } from '@angular/core';
import { TreeStateService } from '@exense/step-core';
import { ReportNodeWithChildren } from '../shared/report-node-with-children';
import { ReportTreeNode } from '../shared/report-tree-node';
import { ReportTreeNodeUtilsService } from './report-tree-node-utils.service';

@Injectable()
export class ReportTreeStateService extends TreeStateService<
  ReportNodeWithChildren,
  ReportTreeNode,
  ReportTreeNodeUtilsService
> {}
