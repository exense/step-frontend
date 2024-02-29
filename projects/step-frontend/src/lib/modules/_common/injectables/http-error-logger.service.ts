import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HttpErrorLoggerService {
  private isEnabled = true;

  enable(): void {
    this.isEnabled = true;
  }

  disable(): void {
    this.isEnabled = false;
  }

  log(message: string, error: Error): void {
    if (!this.isEnabled) {
      return;
    }
    console.log(message, error);
  }
}
