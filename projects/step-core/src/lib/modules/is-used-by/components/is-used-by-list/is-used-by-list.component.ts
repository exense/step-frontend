import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { map, startWith } from 'rxjs';
import { FindReferencesResponse, ReferencesService } from '../../../../client/step-client-module';
import { TableFetchLocalDataSource } from '../../../table/table.module';
import { StepBasicsModule, IsUsedBySearchType, ProjectNamePipe } from '../../../basics/step-basics.module';
import { TableModule } from '../../../table/table.module';
import { PlanLinkComponent } from '../../../plan-common';
import { EntityModule } from '../../../entity/entity.module';
import { KeywordsCommonModule } from '../../../keywords-common/keywords-common.module';

interface FindReferenceWithLinkContext extends FindReferencesResponse {
  linkContext?: {
    id: string;
    attributes?: Record<string, string>;
    _class?: string;
    type?: string;
  };
}

@Component({
  selector: 'step-is-used-by-list',
  templateUrl: './is-used-by-list.component.html',
  styleUrls: ['./is-used-by-list.component.scss'],
  imports: [StepBasicsModule, TableModule, PlanLinkComponent, KeywordsCommonModule, EntityModule],
  providers: [ProjectNamePipe],
  standalone: true,
})
export class IsUsedByListComponent implements OnInit {
  private _referencesService = inject(ReferencesService);
  private _projectName = inject(ProjectNamePipe);

  @Input() type?: IsUsedBySearchType;
  @Input() id: string = '';

  @Output() onClose = new EventEmitter<any>();

  currentProjectName: string = '';
  entityType: string = '';

  readonly searchableReferences = new TableFetchLocalDataSource(
    () =>
      this._referencesService
        .findReferences({
          searchType: this.type,
          searchValue: this.id,
        })
        .pipe(map((result) => result.map((item) => this.createReferenceWithLinkContext(item)))),
    TableFetchLocalDataSource.configBuilder<FindReferencesResponse>()
      .addSearchStringPredicate('project', (element) => this._projectName.transform(element))
      .addSortStringPredicate('project', (element) => this._projectName.transform(element))
      .build(),
  );

  readonly emptyResults$ = this.searchableReferences.total$.pipe(
    map((total) => total === 0),
    startWith(false),
  );

  ngOnInit(): void {
    this.determineEntityType();
  }

  closeDialog(): void {
    this.onClose.emit({});
  }

  private createReferenceWithLinkContext(ref: FindReferencesResponse): FindReferenceWithLinkContext {
    let linkContext: FindReferenceWithLinkContext['linkContext'] | undefined = undefined;
    if (ref.type === 'PLAN') {
      linkContext = {
        id: ref.id!,
        attributes: ref.attributes,
        _class: '',
      };
    } else if (ref.type === 'KEYWORD') {
      linkContext = {
        id: ref.id!,
        attributes: ref.attributes,
        type: '',
      };
    }
    return { ...ref, linkContext };
  }

  private determineEntityType(): void {
    switch (this.type) {
      case 'PLAN_ID':
      case 'PLAN_NAME':
        this.entityType = 'plan';
        break;
      case 'KEYWORD_ID':
      case 'KEYWORD_NAME':
        this.entityType = 'functions';
        break;
      case 'RESOURCE_ID':
      case 'RESOURCE_NAME':
        this.entityType = 'resources';
        break;
      default:
        break;
    }
  }
}
