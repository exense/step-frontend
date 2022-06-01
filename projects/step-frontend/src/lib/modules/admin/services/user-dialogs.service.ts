import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserDto, UibModalHelperService, a1Promise2Observable } from '@exense/step-core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserDialogsService {
  constructor(private _httpClient: HttpClient, private _uibModalHelper: UibModalHelperService) {}

  editUser(user: Partial<UserDto> = {}): Observable<{ user: Partial<UserDto>; result: string }> {
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

  resetPassword(user: Partial<UserDto>): Observable<any> {
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
}
