import { Component, inject, Input, OnChanges, SimpleChanges, TrackByFunction, ViewChild } from '@angular/core';
import { KeyValue } from '@angular/common';
import { NgForm } from '@angular/forms';
import { map } from 'rxjs';
import { DataSourceType } from '../../shared/data-source-type.enum';
import {
  ArtefactContext,
  ArtefactFormChangeHelperService,
  BaseArtefactComponent,
  PrivateDataPoolPluginService,
} from '@exense/step-core';
import { DataSourceConfigurationArtefact } from '../../shared/data-source-configuration-artefact';
import { DataSourceConf } from '../../shared/data-source-conf';

type DataSourceTypeItem = KeyValue<DataSourceType, string>;

const createDataSourceTypeItem = (key: DataSourceType, value: string): DataSourceTypeItem => ({ key, value });

@Component({
  selector: 'step-data-source-configuration',
  templateUrl: './data-source-configuration.component.html',
  styleUrls: ['./data-source-configuration.component.scss'],
  providers: [ArtefactFormChangeHelperService],
})
export class DataSourceConfigurationComponent
  extends BaseArtefactComponent<DataSourceConfigurationArtefact>
  implements OnChanges
{
  private _poolApi = inject(PrivateDataPoolPluginService);

  @Input() override context!: ArtefactContext<DataSourceConfigurationArtefact>;

  @ViewChild('form')
  protected form!: NgForm;

  readonly DataSourceType = DataSourceType;

  readonly dataSourceTypes: DataSourceTypeItem[] = [
    createDataSourceTypeItem(DataSourceType.EXCEL, 'Excel'),
    createDataSourceTypeItem(DataSourceType.CSV, 'CSV'),
    createDataSourceTypeItem(DataSourceType.SQL, 'SQL'),
    createDataSourceTypeItem(DataSourceType.FILE, 'Flat file'),
    createDataSourceTypeItem(DataSourceType.FOLDER, 'Dictionary'),
    createDataSourceTypeItem(DataSourceType.SEQUENCE, 'Integer sequence'),
    createDataSourceTypeItem(DataSourceType.JSON_ARRAY, 'Json array'),
    createDataSourceTypeItem(DataSourceType.JSON, 'Json String (Legacy)'),
    createDataSourceTypeItem(DataSourceType.GSHEET, 'Google Sheet v4'),
  ];

  readonly trackByDataSourceType: TrackByFunction<DataSourceTypeItem> = (index, item) => item.key;

  protected handleDataSourceTypeChange(dataSourceType?: DataSourceType): void {
    if (!this.context.artefact || dataSourceType === this.context.artefact.dataSourceType) {
      return;
    }
    this.context.artefact!.dataSourceType = dataSourceType;
    if (!dataSourceType) {
      this.context.save();
      return;
    }

    this._poolApi
      .getDataPoolDefaultInstance(dataSourceType)
      .pipe(map((conf) => conf as DataSourceConf))
      .subscribe((conf) => {
        this.context.artefact!.dataSource = conf;
        this.context.save();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cContext = changes['context'];
    if (cContext?.previousValue !== cContext?.currentValue || cContext?.firstChange) {
      this.contextChange();
    }
  }
}
