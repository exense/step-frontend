import { Component, Input, Output, EventEmitter, Inject } from '@angular/core';
import { IRootScopeService } from 'angular';
import {
  AJS_MODULE,
  AJS_ROOT_SCOPE,
  AugmentedAdminService,
  Mutable,
  ReferencesService,
  TableLocalDataSource,
} from '@exense/step-core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { BehaviorSubject, switchMap, shareReplay, tap, pipe, map } from 'rxjs';

type SearchType = 'PLAN_ID' | 'PLAN_NAME' | 'KEYWORD_ID' | 'KEYWORD_NAME' | 'RESOURCE_ID' | 'RESOURCE_NAME';
type InProgress = Mutable<Pick<IsUsedByListComponent, 'inProgress'>>;

@Component({
  selector: 'step-is-used-by-list',
  templateUrl: './is-used-by-list.component.html',
  styleUrls: ['./is-used-by-list.component.scss'],
})
export class IsUsedByListComponent {
  @Input() title: string = '';
  @Input() type: string = '';
  @Input() id: string = '';

  @Output() onClose = new EventEmitter<any>();

  readonly inProgress: boolean = false;

  projectIdToProjectNameMap: { [id: string]: string } = {};
  currentProjectName: string = '';
  emptyResults: boolean = false;

  private _findReferencesRequest$ = new BehaviorSubject<unknown>({});
  readonly references$ = this._findReferencesRequest$.pipe(
    // tap(() => ((this as InProgress).inProgress = true)),
    switchMap(() =>
      this._referencesService.findReferences({
        searchType: this.type as SearchType,
        searchValue: this.id,
      })
    ),
    // tap((result) => (this.emptyResults = result.length === 0)),
    // tap(() => ((this as InProgress).inProgress = false)),
    shareReplay(1)
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

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepIsUsedByList', downgradeComponent({ component: IsUsedByListComponent }));
