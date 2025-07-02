import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  ArtefactInlineItemSource,
  ArtefactInlineItemUtilsService,
  BaseReportDetailsComponent,
  ReportNodeWithArtefact,
} from '@exense/step-core';
import { DataSetArtefact } from '../../types/data-set.artefact';
import { DataSourceFieldsService } from '../../injectables/data-source-fields.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, of, switchMap } from 'rxjs';

@Component({
  selector: 'step-data-set-report-details',
  templateUrl: './data-set-report-details.component.html',
  styleUrl: './data-set-report-details.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class DataSetReportDetailsComponent extends BaseReportDetailsComponent<ReportNodeWithArtefact<DataSetArtefact>> {
  private _dataSourceFields = inject(DataSourceFieldsService);
  private _artefactInlineUtils = inject(ArtefactInlineItemUtilsService);

  private items$ = toObservable(this.node).pipe(
    switchMap((reportNode) => {
      const artefact = reportNode?.resolvedArtefact;
      if (!artefact?.dataSourceType || !artefact?.dataSource) {
        return of(undefined);
      }
      return this._dataSourceFields.createDataSourceFields(artefact.dataSourceType, artefact.dataSource, true).pipe(
        map((items) => [...items, ['for write', artefact?.dataSource?.forWrite, 'log-in']] as ArtefactInlineItemSource),
        map((items) => this._artefactInlineUtils.convert(items)),
      );
    }),
  );

  protected readonly items = toSignal(this.items$);
}
