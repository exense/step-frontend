import { Component, Input } from '@angular/core';
import {
  AJS_MODULE,
  AugmentedAdminService,
  Mutable,
  ProjectDto,
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
  @Input() title!: string;
  @Input() type!: string;
  @Input() id!: string;

  readonly inProgress: boolean = false;

  projectIdToDtoMap: { [id: string]: ProjectDto } = {};
  emptyResults: boolean = false;

  private _findReferencesRequest$ = new BehaviorSubject<unknown>({});
  readonly references$ = this._findReferencesRequest$.pipe(
    tap(() => ((this as InProgress).inProgress = true)),
    switchMap(() =>
      this._referencesService.findReferences({
        searchType: this.type as SearchType,
        searchValue: this.id,
      })
    ),
    tap((result) => (this.emptyResults = result.length === 0)),
    tap(() => ((this as InProgress).inProgress = false)),
    shareReplay(1)
  );

  readonly searchableReferences$ = new TableLocalDataSource(this.references$, {
    searchPredicates: {
      project: (element, searchValue) =>
        this.projectIdToDtoMap[element.attributes!['project']!.toLowerCase()].attributes.name.includes(
          searchValue.toLowerCase()
        ),
    },
    sortPredicates: {
      project: (elementA, elementB) =>
        this.projectIdToDtoMap[elementB.attributes!['project']!.toLowerCase()].attributes.name.localeCompare(
          this.projectIdToDtoMap[elementB.attributes!['project']!.toLowerCase()].attributes.name
        ),
    },
  });

  constructor(private _referencesService: ReferencesService, private _augmentedAdminService: AugmentedAdminService) {
    this._augmentedAdminService
      .getAllProjects()
      .pipe(
        map((projectDtos: Array<ProjectDto>) => {
          return projectDtos.reduce(function (map: { [id: string]: ProjectDto }, dto) {
            map[dto.id] = dto;
            return map;
          }, {});
        })
      )
      .subscribe((projectIdToDto) => {
        this.projectIdToDtoMap = projectIdToDto;
      });
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepIsUsedByList', downgradeComponent({ component: IsUsedByListComponent }));
