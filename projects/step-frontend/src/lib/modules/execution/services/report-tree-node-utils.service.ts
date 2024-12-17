import { inject, Injectable } from '@angular/core';
import {
  ArtefactNodeSource,
  ArtefactService,
  ControllerService,
  ReportNode,
  TreeNode,
  TreeNodeUtilsService,
} from '@exense/step-core';
import { EXECUTION_TREE_PAGING_SETTINGS, ExecutionTreePagingService } from './execution-tree-paging.service';
import { ReportTreeNode } from '../shared/report-tree-node';
import { forkJoin, map, Observable, tap } from 'rxjs';
import { ReportNodeWithChildren } from '../shared/report-node-with-children';

@Injectable()
export class ReportTreeNodeUtilsService implements TreeNodeUtilsService<ReportNodeWithChildren, ReportTreeNode> {
  private _paging = inject(EXECUTION_TREE_PAGING_SETTINGS);
  private _artefactTypes = inject(ArtefactService);
  private _controllerService = inject(ControllerService);
  private _executionTreePagingService = inject(ExecutionTreePagingService);

  private readonly hasChildrenFlags: Record<string, boolean> = {};

  convertItem(
    item: ReportNodeWithChildren,
    params?: { parentId?: string; isParentVisuallySkipped?: boolean },
  ): ReportTreeNode {
    const id = item.id!;
    const { parentId } = params ?? {};
    const artefact = item.resolvedArtefact;
    const name = item.name ?? '';
    const isSkipped = false;
    const isVisuallySkipped = false;
    const icon = this._artefactTypes.getArtefactType(artefact?._class)?.icon ?? this._artefactTypes.defaultIcon;
    const expandable = this.hasChildren(id);

    const beforeContainer = this.createPseudoContainer(ArtefactNodeSource.BEFORE, item);
    const beforeThreadContainer = this.createPseudoContainer(ArtefactNodeSource.BEFORE_THREAD, item);
    const afterThreadContainer = this.createPseudoContainer(ArtefactNodeSource.AFTER_THREAD, item);
    const afterContainer = this.createPseudoContainer(ArtefactNodeSource.AFTER, item);

    const children = (item?.children || [])
      .filter(
        (child) => child.parentSource === ArtefactNodeSource.MAIN || child.parentSource === ArtefactNodeSource.SUB_PLAN,
      )
      .map((child) => this.convertItem(child, { parentId: id }));

    if (beforeThreadContainer) {
      children.unshift(beforeThreadContainer);
    }

    if (beforeContainer) {
      children.unshift(beforeContainer);
    }

    if (afterThreadContainer) {
      children.push(afterThreadContainer);
    }

    if (afterContainer) {
      children.push(afterContainer);
    }

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
    updateType: 'append' | 'replace',
  ): void {}

  updateNodeData(
    root: ReportNodeWithChildren,
    nodeId: string,
    data: Partial<Pick<TreeNode, 'name' | 'isSkipped'>>,
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
        if (node.originalNode) {
          node.originalNode.children = children;
        }
      }),
      map((children) => children.length),
    );
  }

  restoreTree(root: ReportNodeWithChildren, nodeIdsToRestore: string[]): Observable<ReportNodeWithChildren> {
    const requests = nodeIdsToRestore.map((parentId) =>
      this.loadNodes(parentId).pipe(map((nodes: ReportNodeWithChildren[]) => ({ parentId, nodes }))),
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
          },
        ),
      ),
      map(({ dictionary, allNodes }) => {
        allNodes.forEach((node) => {
          if (dictionary[node.id!]) {
            node.children = dictionary[node.id!];
          }
        });

        return root;
      }),
    );
  }

  loadNodes(nodeId: string): Observable<ReportNode[]> {
    const skip = this._paging[nodeId]?.skip || 0;
    return this._controllerService
      .getReportNodeChildren(nodeId, skip, this._executionTreePagingService.getExecutionTreePaging())
      .pipe(
        map((nodes) => nodes.filter((node) => node.resolvedArtefact !== null)),
        tap((nodes) => (this.hasChildrenFlags[nodeId] = nodes.length > 0)),
      );
  }

  private createPseudoContainer(
    nodeType: ArtefactNodeSource,
    parentNode: ReportNodeWithChildren,
  ): ReportTreeNode | undefined {
    const parentId = parentNode?.id;
    const childArtefacts = (parentNode.children ?? []).filter((child) => child.parentSource === nodeType);

    if (!childArtefacts?.length) {
      return undefined;
    }
    const id = `${nodeType}|${parentId}`;
    let name = '';
    switch (nodeType) {
      case ArtefactNodeSource.BEFORE:
        name = 'Before';
        break;
      case ArtefactNodeSource.BEFORE_THREAD:
        name = 'Before Thread';
        break;
      case ArtefactNodeSource.AFTER_THREAD:
        name = 'After Thread';
        break;
      case ArtefactNodeSource.AFTER:
        name = 'After';
        break;
      default:
        break;
    }
    const isSkipped = false;
    const isVisuallySkipped = false;
    const icon = 'chevron-left';
    const children = (childArtefacts ?? []).map((child) => this.convertItem(child, { parentId: id }));
    const expandable = true;
    return {
      id,
      name,
      isSkipped,
      isVisuallySkipped,
      icon,
      children,
      expandable,
    };
  }
}
