import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AdminService, AJS_MODULE, AuthService, ContextService, Mutable, User } from '@exense/step-core';
import { BehaviorSubject, noop, of, shareReplay, switchMap, tap } from 'rxjs';
import { UserDialogsService } from '../../services/user-dialogs.service';
import { EditUserDialogComponent } from '../edit-user-dialog/edit-user-dialog.component';

type InProgress = Mutable<Pick<UsersListComponent, 'inProgress'>>;

@Component({
  selector: 'step-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
})
export class UsersListComponent implements OnDestroy {
  private _usersRequest$ = new BehaviorSubject<unknown>({});

  readonly users$ = this._usersRequest$.pipe(
    tap((_) => ((this as InProgress).inProgress = true)),
    switchMap((_) => this._adminApiService.getUserList()),
    tap((_) => ((this as InProgress).inProgress = false)),
    shareReplay(1)
  );

  readonly currentUserName: string;

  readonly inProgress: boolean = false;

  constructor(
    private _adminApiService: AdminService,
    private _userDialogs: UserDialogsService,
    private _auth: AuthService,
    private _matDialog: MatDialog,
    context: ContextService
  ) {
    this.currentUserName = context.userName;
  }

  private loadTable(): void {
    this._usersRequest$.next({});
  }

  resetUserPassword(user: User): void {
    this._userDialogs.resetUserPasswordWithWarning(user).subscribe(noop);
  }

  removeUser(username: string): void {
    this._userDialogs.removeUser(username).subscribe((result: boolean) => {
      if (result) {
        this.loadTable();
      }
    });
  }

  addUser(): void {
    const isDefaultAuthenticator = this._auth.getConf()?.authenticatorName === 'DefaultAuthenticator';

    const dialogRef = this._matDialog.open(EditUserDialogComponent);

    dialogRef
      .afterClosed()
      .pipe(
        switchMap((user?: Partial<User>) => {
          if (!user || !isDefaultAuthenticator) {
            return of();
          }

          return this._userDialogs.resetPassword(user);
        })
      )
      .subscribe((_) => this.loadTable());
  }

  editUser(username: string): void {
    this._adminApiService
      .getUser(username)
      .pipe(
        switchMap((user) => {
          const dialogRef = this._matDialog.open(EditUserDialogComponent, {
            data: {
              user,
            },
          });

          return dialogRef.afterClosed();
        })
      )
      .subscribe(() => this.loadTable());
  }

  ngOnDestroy(): void {
    this._usersRequest$.complete();
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepUsersList', downgradeComponent({ component: UsersListComponent }));
