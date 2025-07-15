import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  ArtefactInlineItemSource,
  ArtefactInlineItemUtilsService,
  BaseReportDetailsComponent,
  ReportNodeWithArtefact,
} from '@exense/step-core';
import { ForEachArtefact } from '../../types/for-each.artefact';
import { DataSourceFieldsService } from '../../injectables/data-source-fields.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, of, switchMap } from 'rxjs';

@Component({
  selector: 'step-for-each-report-details',
  templateUrl: './for-each-report-details.component.html',
  styleUrl: './for-each-report-details.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ForEachReportDetailsComponent extends BaseReportDetailsComponent<ReportNodeWithArtefact<ForEachArtefact>> {
  private _dataSourceFields = inject(DataSourceFieldsService);
  private _artefactInlineUtils = inject(ArtefactInlineItemUtilsService);

  private items$ = toObservable(this.node).pipe(
    switchMap((reportNode) => {
      const artefact = reportNode?.resolvedArtefact;
      if (!artefact?.dataSourceType || !artefact?.dataSource) {
        return of(undefined);
      }
      return this._dataSourceFields.createDataSourceFields(artefact.dataSourceType, artefact.dataSource, true).pipe(
        map((items) => [['threads', artefact.threads, 'log-in'], ...items] as ArtefactInlineItemSource),
        map((items) => this._artefactInlineUtils.convert(items)),
      );
    }),
  );

  protected readonly items = toSignal(this.items$);
}
