import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DialogCommunicationService {
  private dialogActionSource = new Subject<void>();
  dialogAction$ = this.dialogActionSource.asObservable();

  triggerDialogAction() {
    this.dialogActionSource.next();
  }
}
