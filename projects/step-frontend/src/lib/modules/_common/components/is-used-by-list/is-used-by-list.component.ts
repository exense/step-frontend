import { Component, Input, Output, EventEmitter, Inject, OnDestroy } from '@angular/core';
import { IRootScopeService } from 'angular';
import {
  AJS_ROOT_SCOPE,
  AugmentedAdminService,
  Mutable,
  ReferencesService,
  TableLocalDataSource,
} from '@exense/step-core';
import { BehaviorSubject, switchMap, shareReplay, tap, map, startWith } from 'rxjs';
import { IsUsedBySearchType } from '../../shared/is-used-by-search-type';

type InProgress = Mutable<Pick<IsUsedByListComponent, 'inProgress'>>;

@Component({
  selector: 'step-is-used-by-list',
  templateUrl: './is-used-by-list.component.html',
  styleUrls: ['./is-used-by-list.component.scss'],
})
export class IsUsedByListComponent implements OnDestroy {
  @Input() type?: IsUsedBySearchType;
  @Input() id: string = '';

  @Output() onClose = new EventEmitter<any>();

  readonly inProgress: boolean = false;

  projectIdToProjectNameMap: { [id: string]: string } = {};
  currentProjectName: string = '';

  private _findReferencesRequest$ = new BehaviorSubject<unknown>({});
  readonly references$ = this._findReferencesRequest$.pipe(
    tap(() => ((this as InProgress).inProgress = true)),
    switchMap(() =>
      this._referencesService.findReferences({
        searchType: this.type,
        searchValue: this.id,
      })
    ),
    tap(() => ((this as InProgress).inProgress = false)),
    shareReplay(1)
  );

  readonly emptyResults$ = this.references$.pipe(
    map((result) => result.length === 0),
    startWith(false)
  );

  readonly searchableReferences$ = new TableLocalDataSource(this.references$, {
    searchPredicates: {
      project: (element, searchValue) =>
        this.projectIdToProjectNameMap[element.attributes!['project']]
          .toLowerCase()
          .includes(searchValue.toLowerCase()),
    },
    sortPredicates: {
      project: (elementA, elementB) =>
        this.projectIdToProjectNameMap[elementB.attributes!['project']]
          .toLowerCase()
          .localeCompare(this.projectIdToProjectNameMap[elementB.attributes!['project']].toLowerCase()),
    },
  });

  closeDialog(): void {
    this.onClose.emit({});
  }

  constructor(
    private _referencesService: ReferencesService,
    private _augmentedAdminService: AugmentedAdminService,
    @Inject(AJS_ROOT_SCOPE) private _$rootScope: IRootScopeService
  ) {
    this.initTenants();
  }

  ngOnDestroy(): void {
    this._findReferencesRequest$.complete();
  }

  /**
   * Relevant for EE: Reads available projects and currently selected
   * @private
   */
  private initTenants() {
    this.currentProjectName = (this._$rootScope as any).tenant?.name;
    const tenants: Array<any> = (this._$rootScope as any).tenants;
    this.projectIdToProjectNameMap = tenants?.reduce(function (map: { [id: string]: string }, dto) {
      map[dto.projectId] = dto.name;
      return map;
    }, {});
  }
}
