import { Injectable } from '@angular/core';
import { GenerateApiKeyStrategy } from '../shared/generate-api-key-strategy';
import { Observable } from 'rxjs';
import { ApiToken } from '../shared/api-token.interface';

@Injectable({
  providedIn: 'root',
})
export class GenerateApiKeyService implements GenerateApiKeyStrategy {
  private strategy?: GenerateApiKeyStrategy;

  useStrategy(strategy: GenerateApiKeyStrategy): void {
    this.strategy = strategy;
  }

  showGenerateApiKeyDialog(): Observable<ApiToken> {
    if (!this.strategy) {
      console.error('GenerateApiKeyService', 'Missing ServiceAccount strategy');
    }
    return this.strategy!.showGenerateApiKeyDialog();
  }

  getServiceAccountTokens(): Observable<Array<ApiToken>> {
    if (!this.strategy) {
      console.error('GenerateApiKeyService', 'Missing ServiceAccount strategy');
    }
    return this.strategy!.getServiceAccountTokens();
  }

  revoke(id: string): Observable<any> {
    if (!this.strategy) {
      console.error('GenerateApiKeyService', 'Missing ServiceAccount strategy');
    }
    return this.strategy!.revoke(id);
  }
}
