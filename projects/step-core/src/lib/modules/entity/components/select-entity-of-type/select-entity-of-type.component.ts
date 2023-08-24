import { AfterViewInit, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EntityRegistry } from '../../services/entity-registry';
import { ProjectManagementHelperService } from '../../../basics/step-basics.module';
import { SelectEntityOfTypeData } from '../../types/select-entity-of-type-data.interface';
import { SelectEntityOfTypeResult } from '../../types/select-entity-of-type-result.interface';
import { SelectEntityContext } from '../../types/select-entity-context.interface';

@Component({
  selector: 'step-select-entity-of-type',
  templateUrl: './select-entity-of-type.component.html',
  styleUrls: ['./select-entity-of-type.component.scss'],
})
export class SelectEntityOfTypeComponent implements OnInit, OnDestroy {
  private _projectManagementHelper = inject(ProjectManagementHelperService);
  private _entityRegistry = inject(EntityRegistry);
  private _matDialogRef =
    inject<MatDialogRef<SelectEntityOfTypeComponent, SelectEntityOfTypeResult | undefined>>(MatDialogRef);
  protected _dialogData = inject<SelectEntityOfTypeData>(MAT_DIALOG_DATA);
  protected entity = this._entityRegistry.getEntityByName(this._dialogData.entityName);
  protected selectEntityContext: SelectEntityContext = {
    multipleSelection: !this._dialogData.singleSelection,
    handleSelect: (item: any) => this.handleSelect(item),
    getSourceId: () => this._dialogData.sourceId,
  };
  protected migrationTarget: string = '';
  protected currentProject: string = '';

  ngOnInit(): void {
    this.setupTitle();
  }

  ngOnDestroy(): void {
    this.selectEntityContext.handleSelect = undefined;
  }

  proceed(): void {
    const selectedIds = this.selectEntityContext?.getSelectedIds ? this.selectEntityContext.getSelectedIds() : [];

    const result: SelectEntityOfTypeResult = {
      entity: this.entity,
      array: selectedIds as string[],
    };
    this._matDialogRef.close(result);
  }

  proceedFiltered(): void {
    const tableRequest = this.selectEntityContext?.getLastServerSideRequest
      ? this.selectEntityContext.getLastServerSideRequest()
      : undefined;

    const filters = tableRequest?.filters;

    const result: SelectEntityOfTypeResult = {
      entity: this.entity,
      filters,
    };

    this._matDialogRef.close(result);
  }

  cancel(): void {
    this._matDialogRef.close(undefined);
  }

  protected setupTitle(): void {
    const { targetId } = this._dialogData;
    if (!targetId) {
      return;
    }
    this.migrationTarget = this._projectManagementHelper.getProjectById(targetId)?.name || '';
    this.currentProject = this._projectManagementHelper.getCurrentProject()?.name || '';
  }

  private handleSelect(item: any): void {
    const result: SelectEntityOfTypeResult = {
      entity: this.entity,
      item: item,
    };
    this._matDialogRef.close(result);
  }
}
