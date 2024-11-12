import { Component, inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AddSchemaFieldDialogComponent } from '../add-schema-field-dialog/add-schema-field-dialog.component';
import {
  SchemaArrayField,
  SchemaField,
  JsonFieldsSchema,
  JsonFieldSchemaMeta,
  JsonFieldType,
  SchemaObjectField,
  JsonSchemaFieldType,
} from '../../../json-forms';

@Component({
  selector: 'step-add-field-schema-button',
  templateUrl: './add-field-schema-button.component.html',
  styleUrls: ['./add-field-schema-button.component.scss'],
})
export class AddFieldSchemaButtonComponent {
  private _ngControl = inject(NgControl, { optional: true });
  private _matDialog = inject(MatDialog);

  openAddFieldDialog(): void {
    this._matDialog
      .open<AddSchemaFieldDialogComponent, unknown, JsonFieldSchemaMeta>(AddSchemaFieldDialogComponent)
      .afterClosed()
      .subscribe((fieldMeta) => {
        if (!fieldMeta || !this._ngControl) {
          return;
        }
        this.addField(fieldMeta);
      });
  }

  private addField(fieldMeta: JsonFieldSchemaMeta): void {
    const schema: JsonFieldsSchema = { ...(this._ngControl!.value ?? {}) };
    if (!schema.properties) {
      schema.properties = {};
    }

    let fieldProperty: SchemaField = {};

    if (fieldMeta.type === JsonSchemaFieldType.ENUM) {
      fieldProperty.enum = fieldMeta.enumItems;
    } else if (fieldMeta.type === JsonSchemaFieldType.ARRAY) {
      fieldProperty = {
        type: JsonFieldType.ARRAY,
        items: { type: JsonFieldType.STRING },
      } as SchemaArrayField;
    } else if (fieldMeta.type === JsonSchemaFieldType.OBJECT) {
      fieldProperty = {
        type: JsonFieldType.OBJECT,
        properties: {},
      } as SchemaObjectField;
    } else {
      fieldProperty.type = fieldMeta.type;
    }

    if (fieldMeta.defaultValue !== undefined) {
      fieldProperty.default = fieldMeta.defaultValue;
    }
    if (fieldMeta.description) {
      fieldProperty.description = fieldMeta.description;
    }

    schema.properties[fieldMeta.name] = fieldProperty;
    if (fieldMeta.isRequired) {
      schema.required = schema.required ?? [];
      schema.required.push(fieldMeta.name);
    }
    this._ngControl!.control!.setValue(schema);
  }
}
