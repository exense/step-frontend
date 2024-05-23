import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, filter, map } from 'rxjs';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData,
  ConfirmationDialogResult,
} from '../components/confirmation-dialog/confirmation-dialog.component';
import {
  EnterTextValueDialogComponent,
  EnterTextValueDialogData,
  EnterTextValueDialogResult,
} from '../components/enter-text-value-dialog/enter-text-value-dialog.component';
import {
  MessageDialogComponent,
  MessageDialogData,
  MessageDialogResult,
} from '../components/message-dialog/message-dialog.component';
import {
  MessagesListDialogComponent,
  MessagesListDialogData,
  MessagesListDialogResult,
} from '../components/messages-list-dialog/messages-list-dialog.component';
import { AlertType } from '../types/alert-type.enum';

@Injectable({
  providedIn: 'root',
})
export class DialogsService {
  private _matDialog = inject(MatDialog);

  enterValue(title: string, value: string, multiline?: boolean): Observable<string> {
    const dialogRef = this._matDialog.open<
      EnterTextValueDialogComponent,
      EnterTextValueDialogData,
      EnterTextValueDialogResult
    >(EnterTextValueDialogComponent, {
      data: {
        title,
        value,
        multiline,
      },
    });

    // Make sure we do not emit further when dialog is closed by clicking outside or by cancelling
    return dialogRef.afterClosed().pipe(filter((result) => result !== undefined)) as Observable<string>;
  }

  showWarning(message: string, alertType?: AlertType): Observable<boolean> {
    const dialogRef = this._matDialog.open<
      ConfirmationDialogComponent,
      ConfirmationDialogData,
      ConfirmationDialogResult
    >(ConfirmationDialogComponent, {
      data: {
        message,
        alertType,
      },
    });

    // Explicitly map to a boolean to ensure consistency
    return dialogRef.afterClosed().pipe(map((result) => !!result)) as Observable<boolean>;
  }

  showDeleteWarning(itemsCount: number, itemName?: string, secondaryText?: string): Observable<boolean> {
    let message: string = '';

    if (itemsCount === 1) {
      message = itemName
        ? `Are you sure you want to delete the ${itemName}?`
        : 'Are you sure you want to delete this item?';
    } else {
      message = `Are you sure you want to delete these ${itemsCount} items?`;
    }

    if (secondaryText) {
      message += '\n\n' + secondaryText;
    }

    return this.showWarning(message);
  }

  showEntityInAnotherProject(newProjectName?: string): Observable<boolean> {
    let message: string = '';

    if (newProjectName) {
      message = `This entity is part of the project "${newProjectName}". Do you wish to switch to this project?`;
    } else {
      message = 'This entity is part of another project. Do you wish to switch to this project?';
    }

    return this.showWarning(message);
  }

  showListOfMsgs(messages: string[]): Observable<boolean> {
    const dialogRef = this._matDialog.open<
      MessagesListDialogComponent,
      MessagesListDialogData,
      MessagesListDialogResult
    >(MessagesListDialogComponent, {
      data: {
        messages,
      },
    });

    // Explicitly map to a boolean to ensure consistency
    return dialogRef.afterClosed().pipe(map((result) => !!result)) as Observable<boolean>;
  }

  showErrorMsg(messageHTML: string): Observable<boolean> {
    const dialogRef = this._matDialog.open<MessageDialogComponent, MessageDialogData, MessageDialogResult>(
      MessageDialogComponent,
      {
        data: {
          messageHTML,
        },
      },
    );

    // Explicitly map to a boolean to ensure consistency
    return dialogRef.afterClosed().pipe(map((result) => !!result)) as Observable<boolean>;
  }
}
