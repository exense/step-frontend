import { Component, inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AddSchemaFieldDialogComponent } from '../add-schema-field-dialog/add-schema-field-dialog.component';
import { FieldSchemaMeta } from '../../shared/field-schema-meta.interface';
import { DynamicFieldProperty, DynamicFieldsSchema } from '../../shared/dynamic-fields-schema';
import { FieldSchemaType } from '../../shared/field-schema-type.enum';

@Component({
  selector: 'step-add-field-schema-button',
  templateUrl: './add-field-schema-button.component.html',
  styleUrls: ['./add-field-schema-button.component.scss'],
})
export class AddFieldSchemaButton {
  private _ngControl = inject(NgControl, { optional: true });
  private _matDialog = inject(MatDialog);

  openAddFieldDialog(): void {
    this._matDialog
      .open<AddSchemaFieldDialogComponent, unknown, FieldSchemaMeta>(AddSchemaFieldDialogComponent, {
        disableClose: true,
      })
      .afterClosed()
      .subscribe((fieldMeta) => {
        if (!fieldMeta || !this._ngControl) {
          return;
        }
        this.addField(fieldMeta);
      });
  }

  private addField(fieldMeta: FieldSchemaMeta): void {
    const schema: DynamicFieldsSchema = { ...(this._ngControl!.value ?? {}) };
    if (!schema.properties) {
      schema.properties = {};
    }

    const fieldProperty: DynamicFieldProperty = {};

    if (fieldMeta.type === FieldSchemaType.ENUM) {
      fieldProperty.enum = fieldMeta.enumItems;
    } else {
      fieldProperty.type = fieldMeta.type;
    }
    if (fieldMeta.defaultValue !== undefined) {
      fieldProperty.default = fieldMeta.defaultValue;
    }

    schema.properties[fieldMeta.name] = fieldProperty;
    if (fieldMeta.isRequired) {
      schema.required = schema.required ?? [];
      schema.required.push(fieldMeta.name);
    }
    this._ngControl!.control!.setValue(schema);
  }
}
