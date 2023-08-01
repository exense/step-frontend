import { AfterViewInit, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { WIZARD_STEP_LOCAL_CONTEXT } from '../../injectables/wizard-step-local-context.token';
import { WizardStepBehaviorService } from '../../injectables/wizard-step-behavior.service';
import { first, Observable, of } from 'rxjs';

@Component({
  selector: 'step-wizard-step-buttons',
  templateUrl: './wizard-step-buttons.component.html',
  styleUrls: ['./wizard-step-buttons.component.scss'],
})
export class WizardStepButtonsComponent implements AfterViewInit {
  private _localContext = inject(WIZARD_STEP_LOCAL_CONTEXT);
  protected stepBehavior?: WizardStepBehaviorService;

  @Input() isFirst?: boolean;
  @Input() isLast?: boolean;
  @Output() next = new EventEmitter<void>();
  @Output() previous = new EventEmitter<void>();
  @Output() finish = new EventEmitter<void>();
  @Output() closeWizard = new EventEmitter<void>();

  ngAfterViewInit(): void {
    this.stepBehavior = this._localContext.stepBehaviorService;
  }

  goNext(): void {
    this.canGoNext$.pipe(first()).subscribe((canGoNext) => {
      if (canGoNext) {
        this.next.emit();
      }
    });
  }

  goPrevious(): void {
    this.canGoPrevious$.pipe(first()).subscribe((canGoPrevious) => {
      if (canGoPrevious) {
        this.previous.emit();
      }
    });
  }

  goFinish(): void {
    this.canGoNext$.pipe(first()).subscribe((canFinish) => {
      if (canFinish) {
        this.finish.emit();
      }
    });
  }

  private get canGoNext$(): Observable<boolean> {
    if (!this.stepBehavior?.canGoNext$) {
      return of(true);
    }

    return this.stepBehavior.canGoNext$;
  }

  private get canGoPrevious$(): Observable<boolean> {
    if (!this.stepBehavior?.canGoPrevious$) {
      return of(true);
    }

    return this.stepBehavior.canGoPrevious$;
  }
}
