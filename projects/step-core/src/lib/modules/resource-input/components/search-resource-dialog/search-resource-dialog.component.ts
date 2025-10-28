import { Component, inject } from '@angular/core';
import { AugmentedResourcesService, Resource } from '../../../../client/step-client-module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { TableModule } from '../../../table/table.module';

@Component({
  selector: 'step-search-resource-dialog',
  templateUrl: './search-resource-dialog.component.html',
  styleUrls: ['./search-resource-dialog.component.scss'],
  imports: [StepBasicsModule, TableModule],
})
export class SearchResourceDialogComponent {
  private _augmentedResourceService = inject(AugmentedResourcesService);
  private _matDialogRef = inject<MatDialogRef<SearchResourceDialogComponent>>(MatDialogRef);
  private _resourceTypes = inject<string[]>(MAT_DIALOG_DATA);

  readonly filter: string = this._resourceTypes.map((resourceType) => `resourceType=${resourceType}`).join(' or ');

  readonly dataSource = this._augmentedResourceService.createDataSource();

  select(resource: Resource): void {
    this._matDialogRef.close(resource.id);
  }

  cancel(): void {
    this._matDialogRef.close();
  }
}
