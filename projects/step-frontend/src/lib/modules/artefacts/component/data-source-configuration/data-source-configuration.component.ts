import { Component, DestroyRef, inject, Input, OnChanges, output, SimpleChanges, ViewChild } from '@angular/core';
import { KeyValue } from '@angular/common';
import { NgForm } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, startWith, tap } from 'rxjs';
import { DataSourceType } from '../../types/data-source-type.enum';
import {
  AceMode,
  ArtefactContext,
  ArtefactFormChangeHelperService,
  BaseArtefactComponent,
  PrivateDataPoolPluginService,
} from '@exense/step-core';
import { DataSourceConfigurationArtefact } from '../../types/data-source-configuration-artefact';
import { DataSourceConf } from '../../types/data-source-conf';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type DataSourceTypeItem = KeyValue<DataSourceType, string>;

const createDataSourceTypeItem = (key: DataSourceType, value: string): DataSourceTypeItem => ({ key, value });

@Component({
  selector: 'step-data-source-configuration',
  templateUrl: './data-source-configuration.component.html',
  styleUrls: ['./data-source-configuration.component.scss'],
  providers: [ArtefactFormChangeHelperService],
  standalone: false,
})
export class DataSourceConfigurationComponent
  extends BaseArtefactComponent<DataSourceConfigurationArtefact>
  implements OnChanges
{
  private _poolApi = inject(PrivateDataPoolPluginService);
  private _destroyRef = inject(DestroyRef);

  readonly forceProtected = output<boolean>();

  // @ts-ignore
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
        this.checkProtection();
        this.context.save();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cContext = changes['context'];
    if (cContext?.previousValue !== cContext?.currentValue || cContext?.firstChange) {
      this.contextChange();
    }
  }

  protected readonly AceMode = AceMode;

  protected override setupFormChanges() {
    super.setupFormChanges();
    const form = this.form?.form;
    if (!form) {
      return;
    }
    form.valueChanges
      .pipe(
        startWith(form.value),
        map((formValue) => {
          const password = formValue?.password;
          return password?.dynamic ? password?.expression : password?.value;
        }),
        tap((password) => console.log('password', password)),
        distinctUntilChanged(),
        debounceTime(300),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(() => {
        const isChanged = this.checkProtection();
        if (isChanged) {
          this.context.save();
        }
      });
  }

  private checkProtection(): boolean {
    const dataSource = this.context.artefact?.dataSource;
    if (!dataSource) {
      return false;
    }
    const isForceProtected =
      (this.context.artefact?.dataSourceType === DataSourceType.EXCEL && !!dataSource.password.value) ||
      !!dataSource.password.expression;

    const isChanged = isForceProtected && !dataSource.protect.value && !dataSource.protect.dynamic;
    if (isChanged) {
      dataSource.protect = { value: true, dynamic: false };
    }

    this.forceProtected.emit(isForceProtected);

    return isChanged;
  }
}
