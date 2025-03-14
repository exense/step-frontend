import { Component, inject, OnDestroy, ViewChild } from '@angular/core';
import {
  AlertType,
  ArtefactFormChangeHelperService,
  BaseArtefactComponent,
  TIME_UNIT_DICTIONARY,
  TimeConvertersFactoryService,
  TimeUnit,
  TimeUnitDictKey,
} from '@exense/step-core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SleepArtefact } from '../../types/sleep.artefact';

@Component({
  selector: 'step-sleep',
  templateUrl: './sleep.component.html',
  styleUrls: ['./sleep.component.scss'],
  providers: [ArtefactFormChangeHelperService],
})
export class SleepComponent extends BaseArtefactComponent<SleepArtefact> implements OnDestroy {
  private _converter = inject(TimeConvertersFactoryService).timeConverter();

  @ViewChild('form')
  protected form!: NgForm;

  private fixDurationUnitSubscription?: Subscription;

  override contextChange() {
    super.contextChange();
    this.fixDurationUnitSubscription?.unsubscribe();
    this.fixDurationUnitSubscription = this.context.artefactChange$.subscribe(() => this.fixDurationUnit());
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this.fixDurationUnitSubscription?.unsubscribe();
  }

  private fixDurationUnit(): void {
    if (this.context?.artefact?._class !== 'Sleep') {
      return;
    }

    if (
      !!this.context?.artefact?.unit?.value &&
      this.context.artefact.unit.value !== 'ms' &&
      !this.context?.artefact?.duration?.dynamic &&
      !this.context?.artefact?.unit?.dynamic
    ) {
      const unitKey = this.context.artefact.unit.value.trim().toLowerCase() as TimeUnitDictKey;
      const unit = TIME_UNIT_DICTIONARY[unitKey];

      const oldValue = this.context.artefact.duration.value ?? 0;
      const newValue = this._converter.calculateModelValue(oldValue, TimeUnit.MILLISECOND, unit);

      this.context.artefact.duration.value = newValue;
      this.context.artefact.unit.value = 'ms';
    }
  }

  protected readonly AlertType = AlertType;
}
