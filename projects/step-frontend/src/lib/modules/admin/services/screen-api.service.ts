import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ScreenDto, ScreenInputDto } from '@exense/step-core';

const URL = 'rest/screens';

@Injectable({
  providedIn: 'root',
})
export class ScreenApiService {
  constructor(private _http: HttpClient) {}

  getScreenChoices(): Observable<string[]> {
    return this._http.get<string[]>(`${URL}`);
  }

  getScreenByScreenChoice(screenChoice: string): Observable<ScreenDto[]> {
    return this._http.get<ScreenDto[]>(`${URL}/input/byscreen/${screenChoice}`);
  }

  removeScreen(dbId: string): Observable<any> {
    return this._http.delete(`${URL}/input/${dbId}`);
  }

  moveScreenPosition(screenId: string, offset: number): Observable<any> {
    return this._http.post('rest/screens/input/' + screenId + '/move', offset);
  }
}
