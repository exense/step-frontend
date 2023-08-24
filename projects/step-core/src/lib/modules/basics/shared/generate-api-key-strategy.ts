import { Observable } from 'rxjs';

export interface GenerateApiKeyStrategy {
  showGenerateApiKeyDialog(): Observable<any>;
  getServiceAccountTokens(): Observable<Array<any>>;
  revoke(id: string): Observable<any>;
}
