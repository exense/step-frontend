import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { IRootScopeService } from 'angular';
import { map, startWith } from 'rxjs';
import { FindReferencesResponse, ReferencesService } from '../../client/step-client-module';
import { TableFetchLocalDataSource } from '../../modules/table/table.module';
import { AJS_ROOT_SCOPE } from '../../shared';
import { IsUsedBySearchType } from '../../modules/basics/step-basics.module';

@Component({
  selector: 'step-is-used-by-list',
  templateUrl: './is-used-by-list.component.html',
  styleUrls: ['./is-used-by-list.component.scss'],
})
export class IsUsedByListComponent {
  @Input() type?: IsUsedBySearchType;
  @Input() id: string = '';

  @Output() onClose = new EventEmitter<any>();

  projectIdToProjectNameMap: { [id: string]: string } = {};
  currentProjectName: string = '';

  readonly searchableReferences = new TableFetchLocalDataSource(
    () =>
      this._referencesService.findReferences({
        searchType: this.type,
        searchValue: this.id,
      }),
    TableFetchLocalDataSource.configBuilder<FindReferencesResponse>()
      .addSearchStringPredicate('project', (element) => this.projectIdToProjectNameMap[element.attributes!['project']])
      .addSortStringPredicate('project', (element) => this.projectIdToProjectNameMap[element.attributes!['project']])
      .build()
  );

  readonly emptyResults$ = this.searchableReferences.total$.pipe(
    map((total) => total === 0),
    startWith(false)
  );

  constructor(
    private _referencesService: ReferencesService,
    @Inject(AJS_ROOT_SCOPE) private _$rootScope: IRootScopeService
  ) {
    this.initTenants();
  }

  closeDialog(): void {
    this.onClose.emit({});
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
