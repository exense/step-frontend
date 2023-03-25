import { Component, Inject } from '@angular/core';
import { AugmentedResourcesService } from '../../client/augmented/services/augmented-resources-service';
import { Resource } from '../../client/generated';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'step-search-resource-dialog',
  templateUrl: './search-resource-dialog.component.html',
  styleUrls: ['./search-resource-dialog.component.scss'],
})
export class SearchResourceDialogComponent {
  readonly dataSource = this._augmentedResourceService.createDatasource();
  readonly filter: string;

  constructor(
    private _augmentedResourceService: AugmentedResourcesService,
    private _matDialogRef: MatDialogRef<SearchResourceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) resourceType: string
  ) {
    this.filter = `resourceType=${resourceType}`;
  }

  select(resource: Resource): void {
    this._matDialogRef.close(resource.id);
  }

  cancel(): void {
    this._matDialogRef.close();
  }
}
