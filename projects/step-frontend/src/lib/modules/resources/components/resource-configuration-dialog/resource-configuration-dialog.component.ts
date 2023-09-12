import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AugmentedResourcesService, Resource, ResourceInputComponent } from '@exense/step-core';
import { Subject, takeUntil } from 'rxjs';
import { ResourceConfigurationDialogData } from './resource-configuration-dialog-data.interface';
import {
  resourceConfigurationDialogFormCreate,
  resourceConfigurationDialogFormSetValueToForm,
  resourceConfigurationDialogFormSetValueToModel,
} from './resource-configuration-dialog.form';

@Component({
  selector: 'step-resource-configuration-dialog',
  templateUrl: './resource-configuration-dialog.component.html',
  styleUrls: ['./resource-configuration-dialog.component.scss'],
})
export class ResourceConfigurationDialogComponent implements OnInit, OnDestroy {
  private _formBuilder = inject(FormBuilder);
  private _matDialogRef = inject<MatDialogRef<ResourceConfigurationDialogComponent, Resource>>(MatDialogRef);
  private _resourcesService = inject(AugmentedResourcesService);

  protected _resourceConfigurationDialogData = inject<ResourceConfigurationDialogData>(MAT_DIALOG_DATA);
  protected _predefinedResourceTypes = [
    { key: 'datasource', value: 'datasource' },
    { key: 'functions', value: 'functions' },
  ];

  private readonly terminator$ = new Subject<void>();

  protected readonly formGroup = resourceConfigurationDialogFormCreate(this._formBuilder);

  @ViewChild('resourceInputControl', { static: false })
  protected resourceInput?: ResourceInputComponent;

  protected loading = false;
  protected uploading = false;
  protected contentUpdated = false;

  ngOnInit(): void {
    // Disable automatic closing, switch to manual
    this._matDialogRef.disableClose = true;

    const { resource, isReadonly } = this._resourceConfigurationDialogData;
    this.setFormValue(resource, isReadonly);
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

    this.loading = true;

    this._resourcesService.getResource(resourceId.replace('resource:', '')).subscribe((resource) => {
      this._resourceConfigurationDialogData.resource = resource;
      this.setFormValue(resource);
      this.loading = false;
      this.uploading = false;
      this.contentUpdated = true;
    });
  }

  protected onFilesChange(): void {
    this.uploading = true;
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
