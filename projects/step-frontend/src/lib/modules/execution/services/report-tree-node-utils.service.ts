import { Inject, Injectable } from '@angular/core';
import { ArtefactTypesService, ControllerService, ReportNode, TreeNode, TreeNodeUtilsService } from '@exense/step-core';
import { EXECUTION_TREE_PAGE_LIMIT, EXECUTION_TREE_PAGING, ExecutionTreePaging } from './execution-tree-paging';
import { ReportTreeNode } from '../shared/report-tree-node';
import { filter, forkJoin, map, Observable, tap } from 'rxjs';
import { ReportNodeWithChildren } from '../shared/report-node-with-children';

@Injectable()
export class ReportTreeNodeUtilsService implements TreeNodeUtilsService<ReportNodeWithChildren, ReportTreeNode> {
  private readonly hasChildrenFlags: Record<string, boolean> = {};

  constructor(
    @Inject(EXECUTION_TREE_PAGING) private _paging: ExecutionTreePaging,
    private _artefactTypes: ArtefactTypesService,
    private _controllerService: ControllerService
  ) {}

  convertItem(
    item: ReportNodeWithChildren,
    params?: { parentId?: string; isParentVisuallySkipped?: boolean }
  ): ReportTreeNode {
    const id = item.id!;
    const { parentId } = params ?? {};
    const artefact = item.resolvedArtefact;
    const name = artefact?.attributes?.['name'] || '';
    const isSkipped = false;
    const isVisuallySkipped = false;
    const icon = artefact ? this._artefactTypes.getIconNg2(artefact._class) : this._artefactTypes.getDefaultIconNg2();
    const expandable = this.hasChildren(id);
    const children = (item?.children || []).map((child) => this.convertItem(child, { parentId: id }));
    const iconClassName = `step-node-status-${item.status}`;
    return {
      id,
      name,
      isSkipped,
      isVisuallySkipped,
      icon,
      expandable,
      children,
      parentId,
      iconClassName,
      originalNode: item,
    };
  }

  updateChildren(
    root: ReportNodeWithChildren,
    nodeId: string,
    children: ReportTreeNode[],
    updateType: 'append' | 'replace'
  ): void {}

  updateNodeData(
    root: ReportNodeWithChildren,
    nodeId: string,
    data: Partial<Pick<TreeNode, 'name' | 'isSkipped'>>
  ): boolean {
    return false;
  }

  hasChildren(parentArtefactId: string): boolean {
    if (this.hasChildrenFlags[parentArtefactId] === undefined) {
      return true;
    }
    return this.hasChildrenFlags[parentArtefactId];
  }

  loadChildren(node: ReportTreeNode): Observable<unknown> {
    const nodeId = node.id;
    return this.loadNodes(nodeId).pipe(
      tap((children) => {
        node.originalNode.children = children;
      }),
      map((children) => children.length)
    );
  }

  restoreTree(root: ReportNodeWithChildren, nodeIdsToRestore: string[]): Observable<ReportNodeWithChildren> {
    const requests = nodeIdsToRestore.map((parentId) =>
      this.loadNodes(parentId).pipe(map((nodes: ReportNodeWithChildren[]) => ({ parentId, nodes })))
    );

    return forkJoin(requests).pipe(
      map((response) =>
        response.reduce(
          (result, item) => {
            result.dictionary[item.parentId] = item.nodes;
            result.allNodes = result.allNodes.concat(item.nodes);
            return result;
          },
          {
            dictionary: {} as Record<string, ReportNodeWithChildren[]>,
            allNodes: [root],
          }
        )
      ),
      map(({ dictionary, allNodes }) => {
        allNodes.forEach((node) => {
          if (dictionary[node.id!]) {
            node.children = dictionary[node.id!];
          }
        });

        return root;
      })
    );
  }

  loadNodes(nodeId: string): Observable<ReportNode[]> {
    const skip = this._paging[nodeId]?.skip || 0;
    return this._controllerService.getReportNodeChildren(nodeId, skip, EXECUTION_TREE_PAGE_LIMIT).pipe(
      map((nodes) => nodes.filter((node) => node.resolvedArtefact !== null)),
      tap((nodes) => (this.hasChildrenFlags[nodeId] = nodes.length > 0))
    );
  }
}
