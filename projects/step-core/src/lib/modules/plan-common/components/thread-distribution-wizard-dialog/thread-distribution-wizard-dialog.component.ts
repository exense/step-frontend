import { Component, HostListener, inject, TrackByFunction } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AbstractArtefact, DynamicValueInteger } from '../../../../client/step-client-module';
import { KeyValue } from '@angular/common';
import { ARRAY_KEY_VALUE_LABEL_VALUE_EXTRACTOR, TimeUnit } from '../../../basics/step-basics.module';
import { FormBuilder, Validators } from '@angular/forms';
import { debounceTime, map, shareReplay, startWith } from 'rxjs';
import { StepBasicsModule } from '../../../basics/step-basics.module';

type DistributionForm = ThreadDistributionWizardDialogComponent['wizardForm'];
type DistributionFormValue = DistributionForm['value'];

const calculateValues = (value: DistributionFormValue = {}, durationUnits?: KeyValue<TimeUnit, string>[]) => {
  let threadsNum = 0;
  let pacing = 0;
  let isCalculationValid: boolean | undefined = undefined;
  let unit = '';

  const { iterations, iterationsPerUnit, duration, durationUnit } = value;

  if (durationUnits) {
    unit = durationUnits.find((item) => item.key === durationUnit)?.value ?? '';
  }

  const realDuration = (duration ?? 0) * (durationUnit ?? 0);
  if (!realDuration || !iterationsPerUnit) {
    let pacingDisplay = pacing.toString();
    if (unit) {
      pacingDisplay = `${pacingDisplay} ${unit}`;
    }
    return { threadsNum, pacing, isCalculationValid, pacingDisplay };
  }
  threadsNum = Math.ceil((iterations ?? 0) / (iterationsPerUnit! / realDuration!));
  pacing = iterationsPerUnit! / (iterations! / threadsNum);
  isCalculationValid = pacing >= realDuration;

  let pacingDisplay = Math.round(pacing / durationUnit!).toString();
  if (unit) {
    pacingDisplay = `${pacingDisplay} ${unit}`;
  }
  return { threadsNum, pacing, pacingDisplay, isCalculationValid };
};

@Component({
  selector: 'step-thread-distribution-wizard-dialog',
  templateUrl: './thread-distribution-wizard-dialog.component.html',
  styleUrls: ['./thread-distribution-wizard-dialog.component.scss'],
  standalone: true,
  imports: [StepBasicsModule],
})
export class ThreadDistributionWizardDialogComponent {
  private _fb = inject(FormBuilder);
  private _artefact = inject<AbstractArtefact>(MAT_DIALOG_DATA);
  private _matDialogRef = inject(MatDialogRef);
  protected readonly _timeUnitArrayItemExtractor = inject(ARRAY_KEY_VALUE_LABEL_VALUE_EXTRACTOR);

  readonly iterationUnits: KeyValue<TimeUnit, string>[] = [
    { key: TimeUnit.SECOND, value: 'Second' },
    { key: TimeUnit.MINUTE, value: 'Minute' },
    { key: TimeUnit.HOUR, value: 'Hour' },
  ];

  readonly durationUnits: KeyValue<TimeUnit, string>[] = [
    { key: TimeUnit.SECOND, value: 'Second(s)' },
    { key: TimeUnit.MINUTE, value: 'Minute(s)' },
    { key: TimeUnit.HOUR, value: 'Hour(s)' },
  ];

  readonly trackByUnit: TrackByFunction<KeyValue<TimeUnit, string>> = (index, item) => item.key;

  readonly wizardForm = this._fb.group({
    iterations: this._fb.control(null, [Validators.required, Validators.min(1)]),
    iterationsPerUnit: this._fb.control(TimeUnit.SECOND),
    duration: this._fb.control(null, [Validators.required, Validators.min(1)]),
    durationUnit: this._fb.control(TimeUnit.SECOND),
  });

  readonly calculationResult$ = this.wizardForm.valueChanges.pipe(
    startWith(this.wizardForm.value),
    debounceTime(300),
    map((value) => calculateValues(value, this.durationUnits)),
    shareReplay(1),
  );

  readonly isCalculationValid$ = this.calculationResult$.pipe(map((result) => result.isCalculationValid));

  @HostListener('keydown.enter')
  applyCalculatedParams(): void {
    if (this.wizardForm.invalid) {
      this.wizardForm.markAllAsTouched();
      return;
    }

    const calculatedParams = calculateValues(this.wizardForm.value);
    if (!calculatedParams.isCalculationValid) {
      return;
    }

    const artefact = this._artefact as {
      users?: DynamicValueInteger;
      pacing?: DynamicValueInteger;
    };

    artefact.users = artefact.users ?? {};
    artefact.pacing = artefact.pacing ?? {};

    const { users: threadsNum, pacing } = artefact;
    if (artefact.users?.dynamic) {
      const expression = calculatedParams.threadsNum.toString();
      artefact.users = { ...artefact.users, expression };
    } else {
      const value = calculatedParams.threadsNum;
      artefact.users = { ...artefact.users, value };
    }

    if (artefact.pacing?.dynamic) {
      const expression = calculatedParams.pacing.toString();
      artefact.pacing = { ...artefact.pacing, expression };
    } else {
      const value = calculatedParams.pacing;
      artefact.pacing = { ...artefact.pacing, value };
    }

    this._matDialogRef.close(artefact);
  }
}
