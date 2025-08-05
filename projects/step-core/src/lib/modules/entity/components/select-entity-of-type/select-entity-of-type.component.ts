import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EntityRegistry } from '../../injectables/entity-registry';
import { SelectEntityOfTypeData } from '../../types/select-entity-of-type-data.interface';
import { SelectEntityOfTypeResult } from '../../types/select-entity-of-type-result.interface';
import { SelectEntityContext } from '../../types/select-entity-context.interface';
import { EntityObject } from '../../types/entity-object';
import { EntityMeta } from '../../types/entity-meta';

@Component({
  selector: 'step-select-entity-of-type',
  templateUrl: './select-entity-of-type.component.html',
  styleUrls: ['./select-entity-of-type.component.scss'],
  standalone: false,
})
export class SelectEntityOfTypeComponent implements OnDestroy {
  private _entityRegistry = inject(EntityRegistry);
  private _matDialogRef =
    inject<MatDialogRef<SelectEntityOfTypeComponent, SelectEntityOfTypeResult | undefined>>(MatDialogRef);
  protected _dialogData = inject<SelectEntityOfTypeData>(MAT_DIALOG_DATA);
  protected entity: EntityMeta = this._entityRegistry.getEntityByName(this._dialogData.entityName);
  protected selectEntityContext: SelectEntityContext = {
    tableFilter: this._dialogData.tableFilter,
    handleSelect: (item: EntityObject) => this.handleSelect(item),
    getSourceId: () => this._dialogData.sourceId,
  };

  ngOnDestroy(): void {
    this.selectEntityContext.handleSelect = undefined;
  }

  cancel(): void {
    this._matDialogRef.close(undefined);
  }

  private handleSelect(item: EntityObject): void {
    const result: SelectEntityOfTypeResult = {
      entity: this.entity,
      item: item,
    };
    this._matDialogRef.close(result);
  }
}
