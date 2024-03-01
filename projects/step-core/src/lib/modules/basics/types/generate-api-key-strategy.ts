import { Observable } from 'rxjs';
import { ApiToken } from './api-token.interface';

export interface GenerateApiKeyStrategy {
  showGenerateApiKeyDialog(): Observable<ApiToken>;
  getServiceAccountTokens(): Observable<Array<ApiToken>>;
  revoke(id: string): Observable<any>;
}
