import { Injectable } from '@angular/core';
import { TreeNode } from '../types/tree-node';
import { TreeFlatNode } from '../types/tree-flat-node';
import { FlattenTreeData } from '../types/flatten-tree-data';

@Injectable({
  providedIn: 'root',
})
export class TreeFlattenerService {
  flattenTree(node?: TreeNode | null): FlattenTreeData {
    const tree: TreeFlatNode[] = [];
    const accessCache = new Map<string, TreeNode>();
    const parentsCache = new Map<string, string | undefined>();

    if (!node) {
      return { tree, accessCache, parentsCache };
    }

    const parentStack: TreeNode[] = [];
    const itemsToProceed: TreeNode[] = [node];

    while (itemsToProceed.length) {
      let parent = parentStack[parentStack.length - 1];

      const item = itemsToProceed.shift()!;

      while (parent && !parent.children?.includes(item)) {
        parentStack.pop();
        parent = parentStack[parentStack.length - 1];
      }

      accessCache.set(item.id, item);
      parentsCache.set(item.id, parent?.id);
      tree.push(
        this.convertNode(
          item,
          parentStack.map((p) => p.id),
        ),
      );

      if (item?.children?.length) {
        itemsToProceed.unshift(...item.children);
        parentStack.push(item);
      }
    }

    return { tree, accessCache, parentsCache };
  }

  private convertNode(node: TreeNode, parentPath: string[]): TreeFlatNode {
    const { id, name, icon, iconClassName, expandable, isSkipped, isVisuallySkipped } = node;

    return {
      id,
      name,
      icon,
      iconClassName,
      expandable,
      isSkipped,
      isVisuallySkipped,
      parentPath,
      parentId: parentPath?.length ? parentPath[parentPath.length - 1] : undefined,
      hasChild: !!node.children?.length,
    };
  }
}
