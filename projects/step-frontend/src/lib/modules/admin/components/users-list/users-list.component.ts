import { Component, OnDestroy } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_MODULE,
  UserDto,
  DialogsService,
  AuthService,
  a1Promise2Observable,
  ContextService,
  Mutable,
} from '@exense/step-core';
import { BehaviorSubject, switchMap, of, catchError, noop, shareReplay, tap, map } from 'rxjs';
import { UserDialogsService } from '../../services/user-dialogs.service';
import { AdminApiService } from '../../services/admin-api.service';

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
    switchMap((_) => this._adminApi.getUsers()),
    tap((_) => ((this as InProgress).inProgress = false)),
    shareReplay(1)
  );

  readonly currentUserName: string;

  readonly inProgress: boolean = false;

  constructor(
    private _adminApi: AdminApiService,
    private _dialogs: DialogsService,
    private _userDialogs: UserDialogsService,
    private _auth: AuthService,
    context: ContextService
  ) {
    this.currentUserName = context.userName;
  }

  private loadTable(): void {
    this._usersRequest$.next({});
  }

  resetUserPassword(user: UserDto): void {
    const message = 'Are you sure you want to reset this users password?';
    a1Promise2Observable(this._dialogs.showWarning(message))
      .pipe(
        switchMap((_) => this._userDialogs.resetPassword(user)),
        catchError((_) => of(false))
      )
      .subscribe(noop);
  }

  removeUser(username: string): void {
    a1Promise2Observable(this._dialogs.showDeleteWarning(1, `User "${username}"`))
      .pipe(
        switchMap((_) => this._adminApi.removeUser(username)),
        map((_) => true),
        catchError((_) => of(false))
      )
      .subscribe((result: boolean) => {
        if (result) {
          this.loadTable();
        }
      });
  }

  addUser(): void {
    const isDefaultAuthenticator = this._auth.getConf()?.authenticatorName === 'DefaultAuthenticator';

    this._userDialogs
      .editUser()
      .pipe(
        switchMap(({ user, result }) => {
          if (result === 'save' && isDefaultAuthenticator) {
            return this._userDialogs.resetPassword(user);
          }
          return of(undefined);
        })
      )
      .subscribe((_) => this.loadTable());
  }

  editUser(username: string): void {
    this._adminApi
      .getUser(username)
      .pipe(switchMap((user) => this._userDialogs.editUser(user)))
      .subscribe((_) => this.loadTable());
  }

  ngOnDestroy(): void {
    this._usersRequest$.complete();
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepUsersList', downgradeComponent({ component: UsersListComponent }));
