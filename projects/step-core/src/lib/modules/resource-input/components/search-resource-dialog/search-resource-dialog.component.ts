import { Component, inject, Inject } from '@angular/core';
import { AugmentedResourcesService, Resource } from '../../../../client/step-client-module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'step-search-resource-dialog',
  templateUrl: './search-resource-dialog.component.html',
  styleUrls: ['./search-resource-dialog.component.scss'],
  standalone: false,
})
export class SearchResourceDialogComponent {
  private _augmentedResourceService = inject(AugmentedResourcesService);
  private _matDialogRef = inject<MatDialogRef<SearchResourceDialogComponent>>(MatDialogRef);
  private _resourceType = inject<string>(MAT_DIALOG_DATA);

  readonly filter: string = `resourceType=${this._resourceType}`;
  readonly dataSource = this._augmentedResourceService.createDataSource();

  select(resource: Resource): void {
    this._matDialogRef.close(resource.id);
  }

  cancel(): void {
    this._matDialogRef.close();
  }
}
