import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResourceInputBridgeService {
  private readonly deleteUploadedResourceInternal$ = new Subject<void>();

  readonly deleteUploadedResource$ = this.deleteUploadedResourceInternal$.asObservable();

  deleteUploadedResource(): void {
    this.deleteUploadedResourceInternal$.next();
  }
}
