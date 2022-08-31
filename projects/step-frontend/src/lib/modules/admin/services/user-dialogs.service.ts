import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  User,
  UibModalHelperService,
  a1Promise2Observable,
  AdminService,
  DialogsService,
  AuthService,
} from '@exense/step-core';
import { Observable, switchMap, of, catchError, map } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class UserDialogsService {
  constructor(
    private _httpClient: HttpClient,
    private _uibModalHelper: UibModalHelperService,
    private _adminApiService: AdminService,
    private _dialogs: DialogsService,
    private _authService: AuthService
  ) {}

  removeUser(username: string): Observable<any> {
    return a1Promise2Observable(this._dialogs.showDeleteWarning(1, `User "${username}"`)).pipe(
      switchMap((_) => this._adminApiService.removeUser(username)),
      map((_) => true),
      catchError((_) => of(false))
    );
  }

  resetUserPasswordWithWarning(user: User): Observable<any> {
    if (this._authService.getConf()?.authenticatorName === 'DefaultAuthenticator') {
      const message = 'Are you sure you want to reset this users password?';
      return a1Promise2Observable(this._dialogs.showWarning(message)).pipe(
        switchMap((_) => this.resetPassword(user)),
        catchError((_) => of(false))
      );
    } else {
      const message =
        'Managing password is not supported by the ' + this._authService.getConf()?.authenticatorName + '.';
      return a1Promise2Observable(this._dialogs.showWarning(message));
    }
  }

  resetPassword(user: Partial<User>): Observable<any> {
    const modalInstance = this._uibModalHelper.open({
      backdrop: 'static',
      templateUrl: 'partials/users/resetPasswordContent.html',
      controller: 'resetPasswordModalCtrl',
      resolve: {
        user: () => user,
      },
    });
    return a1Promise2Observable(modalInstance.result);
  }

  editUser(user: Partial<User> = {}): Observable<{ user: Partial<User>; result: string }> {
    const modalInstance = this._uibModalHelper.open({
      backdrop: 'static',
      templateUrl: 'partials/users/editUserModalContent.html',
      controller: 'editUserModalCtrl',
      resolve: {
        user: () => user,
      },
    });

    const result$ = a1Promise2Observable(modalInstance.result) as Observable<string>;
    return result$.pipe(map((result) => ({ result, user })));
  }
}
