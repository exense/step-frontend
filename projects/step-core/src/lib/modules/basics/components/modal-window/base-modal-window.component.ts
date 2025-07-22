import { Component, HostListener, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  template: '',
  standalone: false,
})
export abstract class BaseModalWindowComponent<T = any, R = any> implements OnInit, OnDestroy {
  private static dialogsStack: BaseModalWindowComponent[] = [];

  private static get topItem(): BaseModalWindowComponent {
    return this.dialogsStack[this.dialogsStack.length - 1];
  }

  protected _dialogRef = inject<MatDialogRef<T, R>>(MatDialogRef);

  @Input() disableCloseByEsc = false;

  ngOnInit(): void {
    this._dialogRef.disableClose = true;
    BaseModalWindowComponent.dialogsStack.push(this);
  }

  ngOnDestroy(): void {
    BaseModalWindowComponent.dialogsStack.pop();
  }

  isTopDialog(): boolean {
    return this === BaseModalWindowComponent.topItem;
  }

  @HostListener('window:keyup.esc')
  protected closeByEsc(): void {
    if (!this.isTopDialog() || this.disableCloseByEsc) {
      return;
    }
    this._dialogRef.close();
  }

  abstract focusDialog(): void;
}
