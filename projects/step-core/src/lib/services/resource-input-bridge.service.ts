import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResourceInputBridgeService {
  private readonly deleteLastUploadedResourceInternal$ = new Subject<void>();

  readonly deleteLastUploadedResource$ = this.deleteLastUploadedResourceInternal$.asObservable();

  deleteLastUploadedResource(): void {
    this.deleteLastUploadedResourceInternal$.next();
  }
}
