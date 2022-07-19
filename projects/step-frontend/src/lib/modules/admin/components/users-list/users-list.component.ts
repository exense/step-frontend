import { Component, OnDestroy } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, AuthService, ContextService, Mutable, AdminService, User } from '@exense/step-core';
import { BehaviorSubject, switchMap, of, noop, shareReplay, tap } from 'rxjs';
import { UserDialogsService } from '../../services/user-dialogs.service';

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
    this._adminApiService
      .getUser(username)
      .pipe(switchMap((user) => this._userDialogs.editUser(user)))
      .subscribe(() => this.loadTable());
  }

  ngOnDestroy(): void {
    this._usersRequest$.complete();
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepUsersList', downgradeComponent({ component: UsersListComponent }));
