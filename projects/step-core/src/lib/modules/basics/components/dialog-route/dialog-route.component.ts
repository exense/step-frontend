import { Component, inject, OnDestroy, OnInit, Type } from '@angular/core';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { DialogParentService } from '../../services/dialog-parent.service';
import { DialogRouteResult } from '../../shared/dialog-route-result';
import { ComponentType } from '@angular/cdk/overlay';

@Component({
  selector: 'step-dialog-route',
  templateUrl: './dialog-route.component.html',
  styleUrls: ['./dialog-route.component.scss'],
})
export class DialogRouteComponent implements OnInit, OnDestroy {
  private _matDialog = inject(MatDialog);
  private _activatedRoute = inject(ActivatedRoute);
  private _router = inject(Router);
  private _dialogParent = inject(DialogParentService, { optional: true });

  private modalRef?: MatDialogRef<unknown>;
  private terminator$ = new Subject<void>();
  private dialogCloseTerminator$?: Subject<void>;

  ngOnInit(): void {
    this._activatedRoute.data.pipe(takeUntil(this.terminator$)).subscribe((data) => this.createModal(data));
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
    this.closeModalAndTerminate();
  }

  private createModal(routeData: Data): void {
    this.closeModalAndTerminate();

    const dialogComponent: Type<unknown> = routeData['dialogComponent'];
    const data = routeData;
    delete data['dialogComponent'];

    this.dialogCloseTerminator$ = new Subject<void>();

    this._matDialog
      .open<unknown, unknown, DialogRouteResult>(dialogComponent, { data })
      .afterClosed()
      .pipe(takeUntil(this.dialogCloseTerminator$))
      .subscribe((result) => {
        if (result?.isSuccess) {
          this._dialogParent?.dialogSuccessfullyClosed();
        }
        const canNavigateBack = result?.canNavigateBack ?? true;
        if (canNavigateBack) {
          if (this._dialogParent?.returnParentUrl) {
            this._router.navigateByUrl(this._dialogParent.returnParentUrl);
          } else {
            this._router.navigate(['..'], { relativeTo: this._activatedRoute });
          }
        }
      });
  }

  private closeModalAndTerminate(): void {
    this.dialogCloseTerminator$?.next();
    this.dialogCloseTerminator$?.complete();
    this.modalRef?.close();
  }
}
