import { Component, HostListener, inject, OnInit, viewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  AugmentedResourcesService,
  DialogRouteResult,
  ModalWindowComponent,
  MultipleProjectsService,
  ReloadableDirective,
  Resource,
  ResourceInputService,
  StepCoreModule,
} from '@exense/step-core';
import { ResourceConfigurationDialogData } from './resource-configuration-dialog-data.interface';
import {
  resourceConfigurationDialogFormCreate,
  resourceConfigurationDialogFormSetValueToForm,
  resourceConfigurationDialogFormSetValueToModel,
} from './resource-configuration-dialog.form';
import { PredefinedResourceType } from './predefined-resource-type.enum';

@Component({
  selector: 'step-resource-configuration-dialog',
  templateUrl: './resource-configuration-dialog.component.html',
  styleUrls: ['./resource-configuration-dialog.component.scss'],
  imports: [StepCoreModule],
  providers: [ResourceInputService],
  hostDirectives: [ReloadableDirective],
})
export class ResourceConfigurationDialogComponent implements OnInit {
  private _formBuilder = inject(FormBuilder);
  private _matDialogRef = inject<MatDialogRef<ResourceConfigurationDialogComponent, DialogRouteResult>>(MatDialogRef);
  private _resourcesService = inject(AugmentedResourcesService);
  private _multipleProjectsService = inject(MultipleProjectsService);
  protected _resourceInputService = inject(ResourceInputService);

  protected _resourceConfigurationDialogData = inject<ResourceConfigurationDialogData>(MAT_DIALOG_DATA);
  protected readonly title = this._resourceConfigurationDialogData?.resource ? 'Edit Resource' : 'New Resource';
  protected _predefinedResourceTypes = [
    { key: PredefinedResourceType.DATA_SOURCE, value: PredefinedResourceType.DATA_SOURCE },
    { key: PredefinedResourceType.FUNCTIONS, value: PredefinedResourceType.FUNCTIONS },
  ];

  protected readonly formGroup = resourceConfigurationDialogFormCreate(this._formBuilder);

  private modalWindow = viewChild(ModalWindowComponent);

  protected loading = false;
  protected uploading = false;
  protected contentUpdated = false;

  ngOnInit(): void {
    // Disable automatic closing, switch to manual
    this._matDialogRef.disableClose = true;

    const { resource } = this._resourceConfigurationDialogData;
    const isReadonly = !!resource && !this._multipleProjectsService.isEntityBelongsToCurrentProject(resource);
    this.setFormValue(resource, isReadonly);
  }

  protected handleContentChange(resourceId?: string): void {
    if (!resourceId?.startsWith?.('resource:')) {
      return;
    }

    this.loading = true;

    this._resourcesService.getResource(resourceId.replace('resource:', '')).subscribe((resource) => {
      this._resourceConfigurationDialogData.resource = resource;
      this.setFormValue(resource);
      this.loading = false;
      this.uploading = false;
      this.contentUpdated = true;
    });
  }

  protected handleFilesChange(): void {
    this.uploading = true;
  }

  @HostListener('window:keyup.esc')
  protected close(): void {
    if (!!this._resourceInputService?.uploadProgress() || !this.modalWindow()?.isTopDialog?.()) {
      return;
    }
    if (!this.contentUpdated) {
      this._matDialogRef.close();
      return;
    }

    const resource = {
      ...this._resourceConfigurationDialogData.resource,
    };

    resourceConfigurationDialogFormSetValueToModel(this.formGroup, resource);

    this._resourcesService.saveResource(resource).subscribe((updatedResource) => {
      this._matDialogRef.close({ isSuccess: !!updatedResource });
    });
  }

  private setFormValue(resource?: Resource, isReadonly?: boolean): void {
    if (!resource) {
      return;
    }

    resourceConfigurationDialogFormSetValueToForm(this.formGroup, resource);

    this.formGroup.controls.name.disable();
    this.formGroup.controls.resourceType.disable();
    if (isReadonly) {
      this.formGroup.controls.content.disable();
    }
  }
}
