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
} from '@angular/core';
import {
  AggregatedReport,
  AggregatedReportView,
  ArtefactService,
  TreeStateInitOptions,
  TreeStateService,
} from '@exense/step-core';
import { AggregatedTreeNode } from '../shared/aggregated-tree-node';
import { FormBuilder } from '@angular/forms';
import { debounceTime, map, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

export type AggregatedTreeStateInitOptions = TreeStateInitOptions & Pick<AggregatedReport, 'resolvedPartialPath'>;

@Injectable()
export class AggregatedReportViewTreeStateService extends TreeStateService<AggregatedReportView, AggregatedTreeNode> {
  private _injector = inject(Injector);
  private _artefactService = inject(ArtefactService);
  private _fb = inject(FormBuilder);

  private searchIndex = new SearchIndex();
  private artefactsNodeIdIndex = new Map<string, string[]>();

  private effectBuildSearchIndex = effect(() => {
    const rootNode = this.rootNode();
    this.searchIndex.clear();
    this.artefactsNodeIdIndex.clear();
    if (rootNode) {
      this.buildSearchIndex(rootNode);
      this.buildArtefactsNodeIdIndex(rootNode);
    }
  });

  private resolvedPartialPathInternal = signal<string | undefined>(undefined);
  readonly resolvedPartialPath = this.resolvedPartialPathInternal.asReadonly();

  readonly searchCtrl = this._fb.nonNullable.control('');

  private searchResultSet$ = this.searchCtrl.valueChanges.pipe(
    startWith(this.searchCtrl.value),
    debounceTime(300),
    map((query) => this.searchIndex.search(query)),
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

  private selectedSearchResultItemInternal = signal<string | undefined>(undefined);
  readonly selectedSearchResult = this.selectedSearchResultItemInternal.asReadonly();

  private searchResultChangeEffect = effect(
    () => {
      const searchResult = this.searchResult();
      const firstItem = searchResult.length > 0 ? searchResult[0] : undefined;
      this.selectedSearchResultItemInternal.set(firstItem);
    },
    { allowSignalWrites: true },
  );

  override init(root: AggregatedReportView, options: AggregatedTreeStateInitOptions = {}) {
    super.init(root, options);
    this.resolvedPartialPathInternal.set(options?.resolvedPartialPath);
  }

  pickSearchResultItemByIndex(index: number): string {
    const item = this.searchResult()[index];
    this.selectedSearchResultItemInternal.set(item);
    return item;
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

  private buildSearchIndex(item: AggregatedTreeNode): void {
    const artefact = item.originalArtefact!;
    const artefactType = this._artefactService.getArtefactType(artefact._class!);

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

    this.searchIndex.register(item.id!, searchValues);

    (item.children ?? []).forEach((child) => this.buildSearchIndex(child as AggregatedTreeNode));
  }
}

class SearchIndex {
  private emptySet = new Set<string>();
  private index = new Map<string, Set<string>>();

  register(item: string, searchValues: string[]): void {
    searchValues.forEach((searchValue) => {
      searchValue = searchValue.toLowerCase();
      if (!this.index.has(searchValue)) {
        this.index.set(searchValue, new Set<string>());
      }
      this.index.get(searchValue)!.add(item);
    });
  }

  search(query: string): ReadonlySet<string> {
    query = (query ?? '').trim().toLowerCase();
    if (!query) {
      return this.emptySet;
    }
    let result = new Set<string>();
    this.index.forEach((items, searchValue) => {
      if (searchValue.includes(query)) {
        // @ts-ignore union method exists in set, but TypeScript can not recognize it yet
        result = result.union(items);
      }
    });
    return result;
  }

  clear(): void {
    this.index.clear();
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
