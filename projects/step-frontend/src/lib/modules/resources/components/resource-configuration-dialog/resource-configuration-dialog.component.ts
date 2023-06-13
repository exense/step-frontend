import { KeyValue } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Resource, ResourcesService } from '@exense/step-core';
import { PredefinedResourceType } from './predefined-resource-type.enum';
import { PREDEFINED_RESOURCE_TYPES } from './predefined-resource-types.token';
import { ResourceConfigurationDialogData } from './resource-configuration-dialog-data.interface';
import {
  resourceConfigurationDialogFormCreate,
  resourceConfigurationDialogFormSetValueToForm,
  resourceConfigurationDialogFormSetValueToModel,
} from './resource-configuration-dialog.form';

const toKeyValue = (predefinedResourceType: PredefinedResourceType): KeyValue<string, string> => ({
  key: predefinedResourceType,
  value: predefinedResourceType,
});

@Component({
  selector: 'step-resource-configuration-dialog',
  templateUrl: './resource-configuration-dialog.component.html',
  styleUrls: ['./resource-configuration-dialog.component.scss'],
})
export class ResourceConfigurationDialogComponent implements OnInit {
  private _formBuilder = inject(FormBuilder);
  private _matDialogRef = inject<MatDialogRef<ResourceConfigurationDialogComponent, Resource>>(MatDialogRef);
  private _resourcesService = inject(ResourcesService);

  protected _resourceConfigurationDialogData = inject<ResourceConfigurationDialogData>(MAT_DIALOG_DATA);
  protected _predefinedResourceTypes = inject<PredefinedResourceType[]>(PREDEFINED_RESOURCE_TYPES).map(toKeyValue);

  protected readonly formGroup = resourceConfigurationDialogFormCreate(this._formBuilder);

  protected contentUpdated = false;

  ngOnInit(): void {
    if (!this._resourceConfigurationDialogData.resource) {
      return;
    }

    resourceConfigurationDialogFormSetValueToForm(this.formGroup, this._resourceConfigurationDialogData.resource);
  }

  protected onContentChange(resourceId: string): void {
    if (!resourceId.startsWith('resource:')) {
      return;
    }

    this._resourcesService.getResource(resourceId.replace('resource:', '')).subscribe((resource) => {
      this._resourceConfigurationDialogData.resource = resource;

      resourceConfigurationDialogFormSetValueToForm(this.formGroup, resource);

      this.contentUpdated = true;
    });
  }

  protected close(): void {
    if (!this.contentUpdated) {
      this._matDialogRef.close();
      return;
    }

    const resource = {
      ...this._resourceConfigurationDialogData.resource,
    };

    resourceConfigurationDialogFormSetValueToModel(this.formGroup, resource);

    this._resourcesService.saveResource(resource).subscribe((updatedResource) => {
      this._matDialogRef.close(updatedResource);
    });
  }
}
