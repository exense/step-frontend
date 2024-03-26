import { Injectable } from '@angular/core';
import { ExecutiontTaskParameters } from '../../../client/step-client-module';
import { v4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class ScheduledTaskTemporaryStorageService {
  private storage = new Map<string, ExecutiontTaskParameters>();

  set(task: ExecutiontTaskParameters): string {
    const temporaryId = v4();
    this.storage.set(temporaryId, task);
    return temporaryId;
  }

  get(temporaryId: string): ExecutiontTaskParameters | undefined {
    return this.storage.get(temporaryId);
  }

  has(temporaryId: string): boolean {
    return this.storage.has(temporaryId);
  }

  cleanup(temporaryId?: string): void {
    if (temporaryId) {
      this.storage.delete(temporaryId);
      return;
    }
    this.storage.clear();
  }
}
