import { KeyValue } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AugmentedResourcesService, Resource, ResourceInputComponent } from '@exense/step-core';
import { Subject, takeUntil } from 'rxjs';
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
export class ResourceConfigurationDialogComponent implements OnInit, OnDestroy {
  @ViewChild(ResourceInputComponent) resourceInput?: ResourceInputComponent;

  private _formBuilder = inject(FormBuilder);
  private _matDialogRef = inject<MatDialogRef<ResourceConfigurationDialogComponent, Resource>>(MatDialogRef);
  private _resourcesService = inject(AugmentedResourcesService);
  private _changeDetectorRef = inject(ChangeDetectorRef);

  protected _resourceConfigurationDialogData = inject<ResourceConfigurationDialogData>(MAT_DIALOG_DATA);
  protected _predefinedResourceTypes = inject<PredefinedResourceType[]>(PREDEFINED_RESOURCE_TYPES).map(toKeyValue);

  private readonly terminator$ = new Subject<void>();

  private onFilesChangeRef?: (files: File[]) => void;

  protected readonly formGroup = resourceConfigurationDialogFormCreate(this._formBuilder);

  protected uploading = false;
  protected contentUpdated = false;

  ngOnInit(): void {
    // Disable automatic closing, switch to manual
    this._matDialogRef.disableClose = true;

    this.setFormValue(this._resourceConfigurationDialogData.resource);
    this.initBackdropClosing();
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
  }

  protected onContentChange(resourceId: string): void {
    if (!resourceId.startsWith('resource:')) {
      return;
    }

    this._resourcesService.getResource(resourceId.replace('resource:', '')).subscribe((resource) => {
      this._resourceConfigurationDialogData.resource = resource;
      this.setFormValue(resource);
    });
  }

  protected onFilesChange(): void {
    this.uploading = true;
    this.contentUpdated = true;
  }

  protected onUploadComplete(): void {
    this.uploading = false;
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

  private onFilesChangeRefOverride(files: File[]): void {
    this.resourceInput!.isResource = true;
    this.onFilesChangeRef?.(files);
    this.resourceInput!.isResource = false;
  }

  private setFormValue(resource?: Resource): void {
    if (!resource) {
      return;
    }

    resourceConfigurationDialogFormSetValueToForm(this.formGroup, resource);

    this.formGroup.controls.name.disable();
    this.formGroup.controls.resourceType.disable();

    // Reflect the changes after updating the form
    this._changeDetectorRef.detectChanges();

    // Explicitly set resourceId
    // - resourceId is the stModel with the "resource:" prefix stripped off,
    // - however, in our case we are using the resource name for stModel (e.g. "dummy.csv"),
    // - so the resourceId cannot be properly evaluated internally
    this.resourceInput!.resourceId = resource.id!;

    // Invoke initResource manually
    this.resourceInput!.initResource(resource.id!);

    // Preserve the original onFilesChange
    this.onFilesChangeRef = this.resourceInput!.onFilesChange.bind(this.resourceInput);

    // Override onFilesChange
    // - given the way the resource input is written,
    // - it requires isResource to be false for the template
    // - in order to render the same content as the old version,
    // - and at the same time isResource needs to be true for
    // - the onFilesChange handler to perform the proper action
    this.resourceInput!.onFilesChange = this.onFilesChangeRefOverride.bind(this);
  }

  private initBackdropClosing(): void {
    this._matDialogRef
      .backdropClick()
      .pipe(takeUntil(this.terminator$))
      .subscribe(() => {
        if (this.uploading) {
          return;
        }

        // Account for closing by clicking the backdrop
        this.close();
      });
  }
}
