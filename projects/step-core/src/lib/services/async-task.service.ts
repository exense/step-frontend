import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, iif, map, Observable, of, switchMap, tap, timer } from 'rxjs';
import { AsyncTaskResultDto, AsyncTaskResultEntities } from '../domain/async-task-result-dto';
import { a1Promise2Observable, DialogsService } from '../shared';

export type AsyncProgressFn = (progress: number, status?: string) => void;

@Injectable({
  providedIn: 'root',
})
export class AsyncTaskService {
  private _pollCount: number = 0;

  private _onProgress?: AsyncProgressFn;

  constructor(private _http: HttpClient, private _dialogs: DialogsService) {}

  private pollUrl(url: string): Observable<AsyncTaskResultDto> {
    return this._http.get<AsyncTaskResultDto>(url).pipe(
      tap(() => this._pollCount++),
      tap(({ progress, status }) => {
        if (this._onProgress) {
          this._onProgress(progress, status);
        }
      }),
      switchMap((data) => {
        // poll
        if (!data.ready) {
          return timer(500).pipe(switchMap((_) => this.pollUrl(url)));
        }

        // warnings
        if ((data.warnings || []).length > 0) {
          return a1Promise2Observable(this._dialogs.showListOfMsgs(data.warnings!)).pipe(map((_) => data));
        }

        return of(data);
      })
    );
  }

  private poll(
    firstInvoke$: Observable<AsyncTaskResultDto>,
    onProgress?: AsyncProgressFn
  ): Promise<AsyncTaskResultEntities> {
    this._onProgress = onProgress;
    const poll$ = firstInvoke$.pipe(
      tap(() => (this._pollCount = 0)),
      map(({ id }) => `rest/controller/async-task/${id}`),
      switchMap((url) => this.pollUrl(url)),
      map((data) => data.result)
    );
    return firstValueFrom(poll$);
  }

  post(requestUrl: string, onProgress?: AsyncProgressFn): Promise<AsyncTaskResultEntities> {
    const request$ = this._http.post<AsyncTaskResultDto>(requestUrl, {});
    return this.poll(request$, onProgress);
  }

  get(requestUrl: string, onProgress?: AsyncProgressFn): Promise<AsyncTaskResultEntities> {
    const request$ = this._http.get<AsyncTaskResultDto>(requestUrl);
    return this.poll(request$, onProgress);
  }
}
