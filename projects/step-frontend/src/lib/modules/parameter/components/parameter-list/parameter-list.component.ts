import { Component, DestroyRef, forwardRef, inject, OnInit } from '@angular/core';
import {
  Parameter,
  tablePersistenceConfigProvider,
  STORE_ALL,
  DialogParentService,
  DialogsService,
  AugmentedParametersService,
  FilterConditionFactoryService,
  tableColumnsConfigProvider,
  entitySelectionStateProvider,
} from '@exense/step-core';
import { filter, switchMap } from 'rxjs';
import { DialogCommunicationService } from '../../services/dialog-communication.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AutomationPackagePermission } from '../../../automation-packages/types/automation-package-permission.enum';

@Component({
  selector: 'step-parameter-list',
  templateUrl: './parameter-list.component.html',
  styleUrls: ['./parameter-list.component.scss'],
  providers: [
    tableColumnsConfigProvider({
      entityTableRemoteId: AugmentedParametersService.PARAMETERS_TABLE_ID,
    }),
    tablePersistenceConfigProvider('parametersList', STORE_ALL),
    ...entitySelectionStateProvider<string, Parameter>('id'),
    {
      provide: DialogParentService,
      useExisting: forwardRef(() => ParameterListComponent),
    },
  ],
  standalone: false,
})
export class ParameterListComponent implements DialogParentService, OnInit {
  private _dialogs = inject(DialogsService);
  private _parametersService = inject(AugmentedParametersService);
  private _dialogCommunicationService = inject(DialogCommunicationService);
  private destroyRef = inject(DestroyRef);

  readonly _filterConditionFactory = inject(FilterConditionFactoryService);

  readonly returnParentUrl = '/parameters';

  readonly dataSource = this._parametersService.createDataSource();

  ngOnInit(): void {
    this._dialogCommunicationService.dialogAction$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.dataSource.reload();
    });
  }

  duplicateParameter(parameter: Parameter): void {
    this._parametersService.cloneParameter(parameter.id!).subscribe(() => this.dataSource.reload());
  }

  deleteParameter(id: string, label: string): void {
    this._dialogs
      .showDeleteWarning(1, `Parameter "${label}"`)
      .pipe(
        filter((result) => result),
        switchMap(() => this._parametersService.deleteParameter(id)),
      )
      .subscribe((result: boolean) => {
        this.dataSource.reload();
      });
  }

  dialogSuccessfullyClosed(): void {
    this.dataSource.reload();
  }

  protected readonly AutomationPackagePermission = AutomationPackagePermission;
}
