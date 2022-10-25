import { Injectable, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModalWindowService {
  private currentlyOpenModalRef?: MatDialogRef<any, any>;

  constructor(private dialog: MatDialog) {}

  openModal(template: TemplateRef<any>): Observable<boolean> {
    this.currentlyOpenModalRef = this.dialog.open(template);
    return this.currentlyOpenModalRef.afterClosed();
  }

  closeCurrentlyOpenModal(result?: boolean): void {
    this.currentlyOpenModalRef?.close(!!result);
  }
}
