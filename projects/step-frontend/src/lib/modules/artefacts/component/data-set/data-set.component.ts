import { Component, ViewChild } from '@angular/core';
import { DataSourceConf } from '../../shared/data-source-conf';
import {
  ArtefactFormChangeHelperService,
  BaseArtefactComponent,
  DynamicValueBoolean,
  DynamicValueString,
} from '@exense/step-core';
import { DataSourceConfigurationArtefact } from '../../shared/data-source-configuration-artefact';
import { NgForm } from '@angular/forms';

interface DataSetDataSource extends DataSourceConf {
  forWrite: DynamicValueBoolean;
}

interface DataSetArtefact extends DataSourceConfigurationArtefact {
  dataSource?: DataSetDataSource;
  item: DynamicValueString;
  resetAtEnd: DynamicValueBoolean;
}

@Component({
  selector: 'step-data-set',
  templateUrl: './data-set.component.html',
  styleUrls: ['./data-set.component.scss'],
  providers: [ArtefactFormChangeHelperService],
})
export class DataSetComponent extends BaseArtefactComponent<DataSetArtefact> {
  @ViewChild('form')
  protected form!: NgForm;
}
