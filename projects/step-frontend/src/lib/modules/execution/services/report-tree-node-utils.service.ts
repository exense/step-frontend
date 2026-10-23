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
import {
  catchError,
  defer,
  EMPTY,
  expand,
  forkJoin,
  last,
  map,
  Observable,
  observeOn,
  of,
  queueScheduler,
  tap,
} from 'rxjs';
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

  restoreTree(root: ReportNodeWithChildren, nodeIdsToRestore: string[]): Observable<ReportNodeWithChildren>;
  restoreTree(root: ReportNodeWithChildren, depth: number): Observable<ReportNodeWithChildren>;
  restoreTree(root: ReportNodeWithChildren, nodesOrDepth: string[] | number): Observable<ReportNodeWithChildren> {
    return typeof nodesOrDepth === 'number'
      ? this.restoreTreeByDepth(root, nodesOrDepth)
      : this.restoreTreeByIds(root, nodesOrDepth);
  }

  private restoreTreeByIds(
    root: ReportNodeWithChildren,
    nodeIdsToRestore: string[],
  ): Observable<ReportNodeWithChildren> {
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

  private restoreTreeByDepth(root: ReportNodeWithChildren, depth: number): Observable<ReportNodeWithChildren> {
    return defer(() => {
      if (!Number.isInteger(depth) || depth < 0) {
        throw new RangeError('Tree depth must be a finite nonnegative integer');
      }

      const stack: { node: ReportNodeWithChildren; depth: number }[] = [{ node: root, depth: 0 }];

      return of(undefined).pipe(
        expand(() => {
          while (stack.length) {
            const entry = stack.pop()!;
            if (entry.depth >= depth) {
              continue;
            }

            const { node, depth: nodeDepth } = entry;
            return defer(() => this.loadNodes(node.id!)).pipe(
              tap((children) => {
                node.children = children;
                for (const child of children) {
                  stack.push({ node: child, depth: nodeDepth + 1 });
                }
              }),
              map(() => undefined),
              catchError(() => {
                delete this.hasChildrenFlags[node.id!];
                return of(undefined);
              }),
              observeOn(queueScheduler),
            );
          }

          return EMPTY;
        }, 1),
        last(),
        map(() => root),
      );
    });
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

  getPathToNode(nodeId: string): Observable<string[]> {
    return this._controllerService.getReportNodePath(nodeId).pipe(
      map((nodes) => {
        nodes.shift();

        const nodesIds = nodes.reduce((res, node, i) => {
          if (
            i > 0 &&
            node.parentSource !== ArtefactNodeSource.MAIN &&
            node.parentSource !== ArtefactNodeSource.SUB_PLAN
          ) {
            const parent = nodes[i - 1];
            const pseudoContainerId = `${node.parentSource}|${parent.id!}`;
            res.push(pseudoContainerId);
          }
          res.push(node.id!);
          return res;
        }, [] as string[]);

        return nodesIds;
      }),
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
      parentId,
    };
  }
}
