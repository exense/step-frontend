import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KeywordEditorService } from '../../generated';

@Injectable({
  providedIn: 'root',
})
export class AugmentedKeywordEditorService extends KeywordEditorService {
  private _httpClient = inject(HttpClient);

  override getFunctionScript(functionId: string): Observable<string> {
    return this._httpClient.get(`rest/scripteditor/function/${functionId}/file`, { responseType: 'text' });
  }

  override saveFunctionScript(functionId: string, requestBody?: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this._httpClient.post(`rest/scripteditor/function/${functionId}/file`, requestBody, { headers });
  }
}
