import {
  computed,
  effect,
  inject,
  Injectable,
  InjectionToken,
  Injector,
  OnDestroy,
  runInInjectionContext,
  signal,
  untracked,
} from '@angular/core';
import {
  AggregatedReport,
  AggregatedReportView,
  ArtefactService,
  DialogsService,
  TreeStateInitOptions,
  TreeStateService,
} from '@exense/step-core';
import { AggregatedTreeNode } from '../shared/aggregated-tree-node';
import { FormBuilder } from '@angular/forms';
import { debounceTime, map, startWith } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AggregatedReportViewTreeNodeUtilsService } from './aggregated-report-view-tree-node-utils.service';
import { ERROR_STATUSES, Status } from '../../_common/shared/status.enum';

export type AggregatedTreeStateInitOptions = TreeStateInitOptions & Pick<AggregatedReport, 'resolvedPartialPath'>;

const ERROR_STATUSES_SEARCH_VALUE = ERROR_STATUSES.join(' | ');

@Injectable()
export class AggregatedReportViewTreeStateService extends TreeStateService<AggregatedReportView, AggregatedTreeNode> {
  private _injector = inject(Injector);
  private _artefactService = inject(ArtefactService);
  private _fb = inject(FormBuilder);
  private _utils = inject(AggregatedReportViewTreeNodeUtilsService);
  private _dialogs = inject(DialogsService);

  private querySearchIndex = new SearchIndex();
  private errorsSearchIndex = new SearchIndex();
  private artefactsNodeIdIndex = new Map<string, string[]>();

  private effectBuildSearchIndex = effect(() => {
    const rootNode = this.rootNode();
    this.querySearchIndex.clear();
    this.errorsSearchIndex.clear();
    this.artefactsNodeIdIndex.clear();
    if (rootNode) {
      this.buildQuerySearchIndex(rootNode);
      this.buildErrorStatusesSearchIndex(rootNode);
      this.buildArtefactsNodeIdIndex(rootNode);
    }
  });

  private resolvedPartialPathInternal = signal<string | undefined>(undefined);
  readonly resolvedPartialPath = this.resolvedPartialPathInternal.asReadonly();

  private searchForErrorsOnlyInternal = signal(false);
  readonly searchForErrorsOnly = this.searchForErrorsOnlyInternal.asReadonly();

  readonly searchCtrl = this._fb.nonNullable.control('');

  private selectedSearchResultItemInternal = signal<string | undefined>(undefined);
  readonly selectedSearchResult = this.selectedSearchResultItemInternal.asReadonly();

  private errorLeafsRootNameInternal = signal<string | undefined>(undefined);
  private errorsLeafsSet = signal<ReadonlySet<string> | undefined>(undefined);
  readonly searchForErrorCause = computed(() => this.errorsLeafsSet() !== undefined);
  readonly errorLeafsRootName = this.errorLeafsRootNameInternal.asReadonly();

  private effectLeafsClean = effect(() => {
    const errorLeafs = this.errorsLeafsSet();
    if (errorLeafs === undefined) {
      this.errorLeafsRootNameInternal.set(undefined);
    }
  });

  private ctrlSearchValue$ = this.searchCtrl.valueChanges.pipe(debounceTime(300));
  private ctrlSearchValue = toSignal(this.ctrlSearchValue$, { initialValue: this.searchCtrl.value });

  private searchValue = computed(() => {
    const errorLeafsRootName = this.errorLeafsRootName();
    const searchErrorsOnly = this.searchForErrorsOnly();
    const ctrlSearchValue = this.ctrlSearchValue();
    if (errorLeafsRootName) {
      return errorLeafsRootName;
    }
    if (searchErrorsOnly) {
      return ERROR_STATUSES_SEARCH_VALUE;
    }
    return ctrlSearchValue;
  });

  private searchResultSet$ = toObservable(this.searchValue).pipe(
    map((searchValue) => {
      const errorLeafsRootName = untracked(() => this.errorLeafsRootName());
      if (!!errorLeafsRootName && searchValue === errorLeafsRootName) {
        return untracked(() => this.errorsLeafsSet());
      } else if (searchValue === ERROR_STATUSES_SEARCH_VALUE) {
        // Search by Status.FAILED will return all possible errors, because
        // the index has been build in such way. It was done for optimization.
        return this.errorsSearchIndex.search(Status.FAILED);
      } else {
        return this.querySearchIndex.search(searchValue);
      }
    }),
  );

  private searchResultSet = toSignal(this.searchResultSet$);

  readonly searchResult = computed(() => {
    const { tree } = this.treeData();
    const searchResultSet = this.searchResultSet();
    if (!searchResultSet || searchResultSet.size === 0) {
      return [];
    }
    return tree.map((node) => node.id).filter((nodeId) => searchResultSet.has(nodeId));
  });

  private searchResultChangeEffect = effect(() => {
    const searchResult = this.searchResult();
    const firstItem = searchResult.length > 0 ? searchResult[0] : undefined;
    this.selectedSearchResultItemInternal.set(firstItem);
  });

  private toggleErrorSearchEffect = effect(() => {
    const errorLeafsRootName = this.errorLeafsRootName();
    const searchErrorsOnly = this.searchForErrorsOnly();
    if (errorLeafsRootName || searchErrorsOnly) {
      this.searchCtrl.setValue('');
      this.searchCtrl.disable();
    } else if (this.searchCtrl.disabled) {
      this.searchCtrl.setValue('');
      this.searchCtrl.enable();
    }
  });

  override init(root?: AggregatedReportView, options: AggregatedTreeStateInitOptions = {}) {
    super.init(root, options);
    this.resolvedPartialPathInternal.set(options?.resolvedPartialPath);
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this.querySearchIndex.clear();
    this.errorsSearchIndex.clear();
    this.artefactsNodeIdIndex.clear();
  }

  toggleErrorSearch(): void {
    this.searchForErrorsOnlyInternal.update((value) => !value);
  }

  findNodesByArtefactId(artefactId?: string): AggregatedTreeNode[] {
    if (!artefactId) {
      return [];
    }
    const { tree, accessCache } = this.treeData();
    return tree
      .map(({ id }) => accessCache.get(id) as AggregatedTreeNode)
      .filter((item) => item.artefactId === artefactId);
  }

  pickSearchResultItemByIndex(index: number): string {
    const item = this.searchResult()[index];
    this.selectedSearchResultItemInternal.set(item);
    return item;
  }

  findErrorLeafs(nodeId: string): void {
    const node = this.findNodeById(nodeId);
    if (!node) {
      this.errorsLeafsSet.set(undefined);
      return;
    }
    const errorStatusesSet = new Set(ERROR_STATUSES);
    const nodeErrorStatuses = this._utils.getNodeStatuses(node).filter((status) => errorStatusesSet.has(status));

    if (!nodeErrorStatuses.length) {
      this.errorsLeafsSet.set(undefined);
      return;
    }

    const root = this.findNodeById(nodeId);
    const name = root?.originalArtefact?.attributes?.['name'] ?? '';

    const errorLeafsSet = new Set<string>();
    this.getSubTree(nodeId)
      .map((node) => this.findNodeById(node.id))
      .forEach((node) => {
        if (!node || !this._utils.nodeHasStatuses(node, ERROR_STATUSES)) {
          return;
        }
        // if current nodes parent was placed into result in previous iteration
        // we need to remove it, because it's not a leaf
        if (node.parentId && errorLeafsSet.has(node.parentId)) {
          errorLeafsSet.delete(node.parentId);
        }
        errorLeafsSet.add(node.id);
      });

    if (!errorLeafsSet.size) {
      this.errorsLeafsSet.set(undefined);
      this._dialogs.showErrorMsg('No root cause could be found in this nodes children.').subscribe();
    } else {
      this.errorLeafsRootNameInternal.set(`${name} (Root Cause)`);
      this.errorsLeafsSet.set(errorLeafsSet);
    }
  }

  clearErrorLeafs(): void {
    this.errorsLeafsSet.set(undefined);
  }

  getNodeIdsByArtefactId(artefactId: string): string[] {
    return this.artefactsNodeIdIndex.get(artefactId) ?? [];
  }

  private buildArtefactsNodeIdIndex(item: AggregatedTreeNode): void {
    const artefact = item.originalArtefact;
    if (artefact) {
      const nodeId = item.id!;
      const artefactId = artefact.id!;
      if (!this.artefactsNodeIdIndex.has(artefactId)) {
        this.artefactsNodeIdIndex.set(artefactId, []);
      }
      this.artefactsNodeIdIndex.get(artefactId)!.push(nodeId);
    }
    (item.children ?? []).forEach((child) => this.buildArtefactsNodeIdIndex(child as AggregatedTreeNode));
  }

  private buildQuerySearchIndex(item: AggregatedTreeNode, parentId?: string): void {
    const artefact = item.originalArtefact;
    if (!artefact?._class) {
      return;
    }
    const artefactType = this._artefactService.getArtefactType(artefact._class);

    const items = runInInjectionContext(this._injector, () => artefactType?.getArtefactSearchValues?.(artefact) ?? []);

    if (item.singleInstanceReportNode) {
      const resolvedArtefactItems = runInInjectionContext(
        this._injector,
        () => artefactType?.getArtefactSearchValues?.(item.singleInstanceReportNode?.resolvedArtefact) ?? [],
      );

      const reportNodeSearchValues = runInInjectionContext(
        this._injector,
        () => artefactType?.getReportNodeSearchValues?.(item.singleInstanceReportNode) ?? [],
      );

      items.push(...resolvedArtefactItems);
      items.push(...reportNodeSearchValues);
    }

    const searchValues = items
      .map((item) => (item.dynamic ? item.expression! : (item.value ?? '').toString()))
      .filter((item) => !!item);

    if (item?.singleInstanceReportNode?.error?.msg) {
      searchValues.push(item?.singleInstanceReportNode?.error?.msg);
    }

    searchValues.push(artefact?.attributes?.['name'] ?? '');

    const nodeId = this._utils.getUniqueId(artefact.id!, parentId);
    this.querySearchIndex.register(nodeId, searchValues);

    (item.children ?? []).forEach((child) => this.buildQuerySearchIndex(child as AggregatedTreeNode, nodeId));
  }

  private buildErrorStatusesSearchIndex(item: AggregatedTreeNode, parentId?: string): void {
    const artefact = item.originalArtefact;
    if (!artefact?._class) {
      return;
    }
    const nodeId = this._utils.getUniqueId(artefact.id!, parentId);

    // As we perform search over all error statuses at once, we use only one status as search condition
    const hasErrorStatuses = this._utils.nodeHasStatuses(item, ERROR_STATUSES);
    if (hasErrorStatuses) {
      this.errorsSearchIndex.register(nodeId, [Status.FAILED]);
    }
    (item.children ?? []).forEach((child) => this.buildErrorStatusesSearchIndex(child as AggregatedTreeNode, nodeId));
  }
}

class SearchIndex {
  private emptySet = new Set<string>();
  private index = new Map<string, Set<string>>();
  private searchResultCache = new Map<string, ReadonlySet<string>>();

  register(item: string, searchValues: string[]): void {
    searchValues.forEach((searchValue) => {
      searchValue = searchValue.toLowerCase();
      if (!this.index.has(searchValue)) {
        this.index.set(searchValue, new Set<string>());
      }
      this.index.get(searchValue)!.add(item);
    });
    this.searchResultCache.clear();
  }

  search(query: string): ReadonlySet<string> {
    query = (query ?? '').trim().toLowerCase();
    if (!query) {
      return this.emptySet;
    }
    if (this.searchResultCache.has(query)) {
      return this.searchResultCache.get(query)!;
    }
    let result = new Set<string>();
    this.index.forEach((items, searchValue) => {
      if (searchValue.includes(query)) {
        // @ts-ignore union method exists in set, but TypeScript can not recognize it yet
        result = result.union(items);
      }
    });
    this.searchResultCache.set(query, result);
    return result;
  }

  clear(): void {
    this.index.clear();
    this.searchResultCache.clear();
  }
}

export const AGGREGATED_TREE_TAB_STATE = new InjectionToken<AggregatedReportViewTreeStateService>(
  'Tree state related to tab',
);
export const AGGREGATED_TREE_WIDGET_STATE = new InjectionToken<AggregatedReportViewTreeStateService>(
  'Tree state related to widget',
);

@Injectable()
export class AggregatedReportViewTreeStateContextService implements OnDestroy {
  private state?: AggregatedReportViewTreeStateService;

  setState(state: AggregatedReportViewTreeStateService): void {
    this.state = state;
  }

  getState(): AggregatedReportViewTreeStateService {
    if (!this.state) {
      throw new Error(`Three state hasn't been initialized.`);
    }
    return this.state;
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  cleanup(): boolean {
    this.state = undefined;
    return true;
  }
}
