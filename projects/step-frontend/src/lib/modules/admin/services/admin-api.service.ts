import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDto } from '@exense/step-core';

const URL = 'rest/admin';

@Injectable({
  providedIn: 'root',
})
export class AdminApiService {
  constructor(private _http: HttpClient) {}

  getUsers(): Observable<UserDto[]> {
    return this._http.get<UserDto[]>(`${URL}/users`);
  }

  getUser(username: string): Observable<UserDto> {
    return this._http.get<UserDto>(`${URL}/user/${username}`);
  }

  removeUser(username: string): Observable<any> {
    return this._http.delete(`${URL}/user/${username}`);
  }

  resetPassword(id: string): Observable<any> {
    return this._http.post(`${URL}/user/${id}/resetpwd`, {});
  }
}
