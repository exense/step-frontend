import { Component, inject, OnDestroy, OnInit, Type, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { map, Subject, switchMap, takeUntil, timer } from 'rxjs';
import { DialogParentService } from '../../injectables/dialog-parent.service';
import { DialogRouteResult } from '../../types/dialog-route-result';

@Component({
  selector: 'step-dialog-route',
  templateUrl: './dialog-route.component.html',
  styleUrls: ['./dialog-route.component.scss'],
})
export class DialogRouteComponent implements OnInit, OnDestroy {
  private _matDialog = inject(MatDialog);
  private _activatedRoute = inject(ActivatedRoute);
  private _viewContainerRef = inject(ViewContainerRef);
  private _router = inject(Router);
  private _dialogParent = inject(DialogParentService, { optional: true });

  private modalRef?: MatDialogRef<unknown>;
  private terminator$ = new Subject<void>();
  private dialogCloseTerminator$?: Subject<void>;

  ngOnInit(): void {
    this._activatedRoute.data
      .pipe(
        switchMap((data) => timer(100).pipe(map(() => data))),
        takeUntil(this.terminator$),
      )
      .subscribe((data) => this.createModal(data));
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

    this.modalRef = this._matDialog.open<unknown, unknown, DialogRouteResult>(dialogComponent, {
      data,
      viewContainerRef: this._viewContainerRef,
    });

    this.modalRef
      .afterClosed()
      .pipe(
        map((result) => {
          result = result || {};
          result.canNavigateBack = result.canNavigateBack ?? true;
          return result;
        }),
        takeUntil(this.dialogCloseTerminator$),
      )
      .subscribe((result) => {
        this.proceedResult(result);
        this.exitRoute(result);
      });
  }

  private closeModalAndTerminate(): void {
    this.dialogCloseTerminator$?.next();
    this.dialogCloseTerminator$?.complete();
    this.modalRef?.close();
  }

  private proceedResult(result?: DialogRouteResult): void {
    result?.isSuccess
      ? this._dialogParent?.dialogSuccessfullyClosed?.()
      : this._dialogParent?.dialogNotSuccessfullyClosed?.();
  }

  private exitRoute(result?: DialogRouteResult): void {
    if (this._dialogParent?.navigateBack) {
      this._dialogParent.navigateBack(result);
      return;
    }

    if (result?.canNavigateBack) {
      if (this._dialogParent?.returnParentUrl) {
        this._router.navigateByUrl(this._dialogParent.returnParentUrl);
      } else {
        this._router.navigate(['..'], { relativeTo: this._activatedRoute });
      }
    }
  }
}
