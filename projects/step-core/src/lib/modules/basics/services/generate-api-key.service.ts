import { Injectable } from '@angular/core';
import { GenerateApiKeyStrategy } from '../shared/generate-api-key-strategy';

@Injectable({
  providedIn: 'root',
})
export class GenerateApiKeyService implements GenerateApiKeyStrategy {
  private strategy?: GenerateApiKeyStrategy;

  useStrategy(strategy: GenerateApiKeyStrategy): void {
    this.strategy = strategy;
  }

  showGenerateApiKeyDialog(): void {
    if (!this.strategy) {
      return;
    }
    this.strategy.showGenerateApiKeyDialog();
  }
}
