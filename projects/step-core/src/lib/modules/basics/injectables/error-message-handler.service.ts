import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface ErrorMessageHandlerStrategy {
  showError(message: string): void;
}

@Injectable({
  providedIn: 'root',
})
export class ErrorMessageHandlerService implements ErrorMessageHandlerStrategy {
  private _snackBar = inject(MatSnackBar);

  private strategy?: ErrorMessageHandlerStrategy;

  showError(message: string): void {
    if (!this.strategy) {
      this._snackBar.open(message, 'dismiss');
      return;
    }
    this.strategy.showError(message);
  }

  useStrategy(strategy: ErrorMessageHandlerStrategy): this {
    this.strategy = strategy;
    return this;
  }
}
