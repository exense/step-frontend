import { TreeNode } from '../types/tree-node';
import { DestroyRef, EnvironmentInjector, inject, Injector, Type } from '@angular/core';
import { TreeStateService } from './tree-state.service';
import { TreeNodeUtilsService } from './tree-node-utils.service';

export const treeStateFactoryProvider =
  <T, N extends TreeNode>(
    tTreeStateService: Type<TreeStateService<T, N>>,
    tTreeNodeUtils: Type<TreeNodeUtilsService<T, N>>,
    isExistingUtils: boolean = false,
  ): (() => TreeStateService<T, N>) =>
  () => {
    const _injector = inject(Injector);
    const _destroyRef = inject(DestroyRef);

    const internalInjector = Injector.create({
      providers: [
        isExistingUtils
          ? {
              provide: TreeNodeUtilsService,
              useExisting: tTreeNodeUtils,
            }
          : {
              provide: TreeNodeUtilsService,
              useClass: tTreeNodeUtils,
            },
        tTreeStateService,
      ],
      parent: _injector,
    }) as EnvironmentInjector;

    _destroyRef.onDestroy(() => internalInjector.destroy());
    return internalInjector.get(tTreeStateService);
  };
