import { Injectable, OnDestroy } from '@angular/core';
import { debounceTime, pairwise, Subject, takeUntil } from 'rxjs';
import { NgForm } from '@angular/forms';

@Injectable()
export class ArtefactFormChangeHelperService implements OnDestroy {
  private terminator$?: Subject<void>;

  ngOnDestroy(): void {
    this.terminate();
  }

  setupFormBehavior(form: NgForm | undefined, operation: () => void): void {
    this.terminate();
    if (!form) {
      return;
    }
    this.terminator$ = new Subject<void>();
    form.form.valueChanges
      .pipe(debounceTime(300), pairwise(), takeUntil(this.terminator$))
      .subscribe(() => operation());
  }

  private terminate(): void {
    if (!this.terminator$) {
      return;
    }
    this.terminator$.next();
    this.terminator$.complete();
    this.terminator$ = undefined;
  }
}
