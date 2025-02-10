import { Component, DestroyRef, inject, OnDestroy, OnInit, Type, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { asyncScheduler, map, observeOn, Subject, switchMap, takeUntil, timer } from 'rxjs';
import { DialogParentService } from '../../injectables/dialog-parent.service';
import { DialogRouteResult } from '../../types/dialog-route-result';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  private _destroyRef = inject(DestroyRef);
  private _dialogParent = inject(DialogParentService, { optional: true });

  private modalRef?: MatDialogRef<unknown>;
  private dialogCloseTerminator$?: Subject<void>;

  ngOnInit(): void {
    this._activatedRoute.data
      .pipe(
        switchMap((data) => timer(100).pipe(map(() => data))),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((data) => this.createModal(data));
  }

  ngOnDestroy(): void {
    this.closeModalAndTerminate();
  }

  private createModal(routeData: Data): void {
    this.closeModalAndTerminate();

    const dialogComponent: Type<unknown> = routeData['dialogComponent'];
    const dialogConfig: MatDialogConfig = routeData['dialogConfig'] ?? {};
    const data = routeData;
    delete data['dialogComponent'];
    delete data['hasBackdrop'];

    this.dialogCloseTerminator$ = new Subject<void>();

    this.modalRef = this._matDialog.open<unknown, unknown, DialogRouteResult>(dialogComponent, {
      ...dialogConfig,
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
        observeOn(asyncScheduler),
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
      this._dialogParent.navigateBack(result, this._activatedRoute);
      return;
    }

    console.log('THE NAVIGATE BACK NOT CALLED');

    if (result?.canNavigateBack) {
      if (this._dialogParent?.returnParentUrl) {
        this._router.navigateByUrl(this._dialogParent.returnParentUrl);
      } else {
        this._router.navigate(['..'], { relativeTo: this._activatedRoute });
      }
    }
  }
}
