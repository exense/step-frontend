import { Component, inject, viewChild } from '@angular/core';
import {
  AppConfigContainerService,
  AuthService,
  BookmarkCreateDialogComponent,
  DialogRouteOpenStateService,
  ViewRegistryService,
} from '@exense/step-core';
import { MatDialog } from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/overlay';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'step-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.scss'],
  standalone: false,
})
export class MainViewComponent {
  private _viewRegistry = inject(ViewRegistryService);
  private _matDialog = inject(MatDialog);
  private _router = inject(Router);
  private _dialogRouteOpenState = inject(DialogRouteOpenStateService);
  readonly _appConfig = inject(AppConfigContainerService);
  readonly _authService = inject(AuthService);

  readonly navBarRightMenuItems = this._viewRegistry.getDashlets('menu/navbar/right');
  readonly adminAlerts = this._viewRegistry.getDashlets('admin/alerts');

  private mainScrollableContent = viewChild('mainScrollableContent', { read: CdkScrollable });

  private navigationEndSubscription = this._router.events
    .pipe(
      filter((event) => event instanceof NavigationEnd),
      takeUntilDestroyed(),
    )
    .subscribe(() => {
      if (this._dialogRouteOpenState.isOpen()) {
        return;
      }
      this.mainScrollableContent()?.scrollTo?.({ top: 0, left: 0 });
    });

  addBookmark(): void {
    this._matDialog.open(BookmarkCreateDialogComponent);
  }
}
