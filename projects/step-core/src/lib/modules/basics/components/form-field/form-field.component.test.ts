import { Component, DestroyRef, inject, input, model, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  AlignLabelAddon,
  decorateWithWarnings,
  ErrorsListComponent,
  FormFieldComponent,
  getControlWarningsContainer,
  StepBasicsModule,
  StepIconComponent,
} from '@exense/step-core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { firstValueFrom, timer } from 'rxjs';

class TestComponentBase {
  protected readonly _fb = inject(FormBuilder);

  readonly form = this._fb.group({
    testField: this._fb.control('', Validators.required),
  });
}

@Component({
  selector: 'step-no-label',
  imports: [StepBasicsModule],
  template: `
    <div [formGroup]="form">
      <step-form-field>
        <input type="text" formControlName="testField" />
      </step-form-field>
    </div>
  `,
})
class NoLabelComponent extends TestComponentBase {}

@Component({
  selector: 'step-with-label',
  imports: [StepBasicsModule],
  template: `
    <div [formGroup]="form">
      <step-form-field [showRequiredMarker]="showRequired()">
        <step-label>Test field</step-label>
        <input type="text" formControlName="testField" />
      </step-form-field>
    </div>
  `,
})
class WithLabelComponent extends TestComponentBase {
  readonly showRequired = input<boolean | undefined>(undefined);
}

@Component({
  selector: 'step-with-label-addon',
  imports: [StepBasicsModule],
  template: `
    <div [formGroup]="form">
      <step-form-field>
        <step-label-addon>
          <step-icon name="help-circle"></step-icon>
        </step-label-addon>
        <input type="text" formControlName="testField" />
      </step-form-field>
    </div>
  `,
})
class WithLabelAddonComponent extends TestComponentBase {}

@Component({
  selector: 'step-with-label-and-addon',
  imports: [StepBasicsModule],
  template: `
    <div [formGroup]="form">
      <step-form-field [alignLabelAddon]="alignLabelAddon()">
        <step-label>Test field</step-label>
        <step-label-addon>
          <step-icon name="help-circle"></step-icon>
        </step-label-addon>
        <input type="text" formControlName="testField" />
      </step-form-field>
    </div>
  `,
})
class WithLabelAndAddonComponent extends TestComponentBase {
  readonly alignLabelAddon = input<AlignLabelAddon>('separate');
}

@Component({
  selector: 'step-with-description',
  imports: [StepBasicsModule],
  template: `
    <div [formGroup]="form">
      <step-form-field>
        <step-description>Test field description</step-description>
        <input type="text" formControlName="testField" />
      </step-form-field>
    </div>
  `,
})
class WithDescriptionComponent extends TestComponentBase {}

@Component({
  selector: 'step-with-hint',
  imports: [StepBasicsModule],
  template: `
    <div [formGroup]="form">
      <step-form-field>
        <input type="text" formControlName="testField" />
        <step-hint>Field's hint</step-hint>
      </step-form-field>
    </div>
  `,
})
class WithHintComponent extends TestComponentBase {}

@Component({
  selector: 'step-with-errors',
  imports: [StepBasicsModule],
  template: `
    <div [formGroup]="form">
      <step-form-field>
        <input type="text" formControlName="testField" />
        <step-error>
          <step-errors-list [errors]="ctrlTestField.errors" [keysDictionary]="errorsDictionary" />
        </step-error>
      </step-form-field>
    </div>
  `,
})
class WithErrorsComponent extends TestComponentBase {
  protected readonly errorsDictionary: Record<string, string> = {
    required: 'This field is required',
  };

  protected readonly ctrlTestField = this.form.controls.testField;
}

@Component({
  selector: 'step-with-explicit-control',
  imports: [StepBasicsModule],
  template: `
    <div>
      <step-form-field [control]="model.control">
        <input type="text" [(ngModel)]="value" required #model="ngModel" />
      </step-form-field>
    </div>
  `,
})
class WithExplicitControlComponent extends TestComponentBase {
  readonly value = model('');
}

@Component({
  selector: 'step-with-warnings',
  imports: [StepBasicsModule],
  template: `
    <div [formGroup]="form">
      <step-form-field>
        <input type="text" formControlName="testField" />
        @if ((ctrlTestField | controlWarnings)?.(); as warnings) {
          <step-warning>
            <step-errors-list [errors]="warnings" />
          </step-warning>
        }
      </step-form-field>
    </div>
  `,
})
class WithWarningsComponent extends TestComponentBase implements OnInit {
  private _destroyRef = inject(DestroyRef);

  readonly ctrlTestField = this.form.controls.testField;

  ngOnInit(): void {
    decorateWithWarnings(this.ctrlTestField, this._destroyRef);
  }
}

describe('FormFieldComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NoLabelComponent,
        WithLabelComponent,
        WithLabelAddonComponent,
        WithLabelAndAddonComponent,
        WithDescriptionComponent,
        WithHintComponent,
        WithErrorsComponent,
        WithExplicitControlComponent,
        WithWarningsComponent,
      ],
    }).compileComponents();
  });

  describe('Label visibility and settings', () => {
    it('No Label', async () => {
      const fixture = TestBed.createComponent(NoLabelComponent);
      fixture.detectChanges();
      await fixture.whenStable();
      const labelContainer = fixture.debugElement.query(By.css('.label-container'));
      expect(labelContainer).toBeTruthy();
      expect(labelContainer.classes['without-children']).toBeTruthy();

      const label = labelContainer.query(By.css('label'));
      expect(label.childNodes.length).toBe(0);
      expect(label.nativeElement.textContent).toBe('');

      const labelAddon = labelContainer.query(By.css('.label-addon'));
      expect(labelAddon.childNodes.length).toBe(0);
      expect(labelAddon.nativeElement.textContent).toBe('');
    });

    it('Label and required marker', async () => {
      const fixture = TestBed.createComponent(WithLabelComponent);
      fixture.detectChanges();
      await fixture.whenStable();
      const labelContainer = fixture.debugElement.query(By.css('.label-container'));
      expect(labelContainer).toBeTruthy();
      expect(labelContainer.classes['without-children']).toBeFalsy();
      expect(labelContainer.classes['show-required-marker']).toBeFalsy();

      const label = labelContainer.query(By.css('label'));
      expect(label.childNodes.length).toBe(1);
      expect(label.nativeElement.textContent).toBe('Test field');

      const labelAddon = labelContainer.query(By.css('.label-addon'));
      expect(labelAddon.childNodes.length).toBe(0);
      expect(labelAddon.nativeElement.textContent).toBe('');

      fixture.componentRef.setInput('showRequired', true);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(labelContainer.classes['show-required-marker']).toBeTruthy();
    });

    it('With label addon', async () => {
      const fixture = TestBed.createComponent(WithLabelAddonComponent);
      fixture.detectChanges();
      await fixture.whenStable();
      const labelContainer = fixture.debugElement.query(By.css('.label-container'));
      expect(labelContainer).toBeTruthy();
      expect(labelContainer.classes['without-children']).toBeFalsy();

      const label = labelContainer.query(By.css('label'));
      expect(label.childNodes.length).toBe(0);
      expect(label.nativeElement.textContent).toBe('');

      const labelAddon = labelContainer.query(By.css('.label-addon'));
      expect(labelAddon.childNodes.length).toBe(1);
      const icon = labelAddon.query(By.directive(StepIconComponent));
      expect(icon).toBeTruthy();
    });

    it('With label and addon', async () => {
      const fixture = TestBed.createComponent(WithLabelAndAddonComponent);
      fixture.detectChanges();
      await fixture.whenStable();
      const labelContainer = fixture.debugElement.query(By.css('.label-container'));
      expect(labelContainer).toBeTruthy();
      expect(labelContainer.classes['without-children']).toBeFalsy();

      const label = labelContainer.query(By.css('label'));
      expect(label.childNodes.length).toBe(1);
      expect(label.nativeElement.textContent).toBe('Test field');

      const labelAddon = labelContainer.query(By.css('.label-addon'));
      expect(labelAddon.childNodes.length).toBe(1);
      const icon = labelAddon.query(By.directive(StepIconComponent));
      expect(icon).toBeTruthy();
    });

    it('Align label addon', async () => {
      const fixture = TestBed.createComponent(WithLabelAndAddonComponent);
      fixture.detectChanges();
      await fixture.whenStable();
      const labelContainer = fixture.debugElement.query(By.css('.label-container'));
      expect(labelContainer).toBeTruthy();
      expect(labelContainer.classes['align-left']).toBeFalsy();
      expect(labelContainer.classes['align-fill']).toBeFalsy();

      fixture.componentRef.setInput('alignLabelAddon', 'near');
      fixture.detectChanges();
      await fixture.whenStable();
      expect(labelContainer.classes['align-left']).toBeTruthy();
      expect(labelContainer.classes['align-fill']).toBeFalsy();

      fixture.componentRef.setInput('alignLabelAddon', 'fill');
      fixture.detectChanges();
      await fixture.whenStable();
      expect(labelContainer.classes['align-left']).toBeFalsy();
      expect(labelContainer.classes['align-fill']).toBeTruthy();

      fixture.componentRef.setInput('alignLabelAddon', 'separate');
      fixture.detectChanges();
      await fixture.whenStable();
      expect(labelContainer.classes['align-left']).toBeFalsy();
      expect(labelContainer.classes['align-fill']).toBeFalsy();
    });
  });

  describe('Description and hint', () => {
    it('Description', async () => {
      const fxtNoDescription = TestBed.createComponent(NoLabelComponent);
      fxtNoDescription.detectChanges();
      await fxtNoDescription.whenStable();

      let description = fxtNoDescription.debugElement
        .query(By.directive(FormFieldComponent))
        .query(By.css('step-description'));

      expect(description).toBeFalsy();

      const fxtDescription = TestBed.createComponent(WithDescriptionComponent);
      fxtDescription.detectChanges();
      await fxtDescription.whenStable();

      description = fxtDescription.debugElement
        .query(By.directive(FormFieldComponent))
        .query(By.css('step-description'));

      expect(description).toBeTruthy();
      expect(description.nativeElement.textContent).toBe('Test field description');
    });

    it('Field hint', async () => {
      const fxtNoHint = TestBed.createComponent(NoLabelComponent);
      fxtNoHint.detectChanges();
      await fxtNoHint.whenStable();

      let hintContainer = fxtNoHint.debugElement.query(By.css('.form-field-hint'));
      expect(hintContainer).toBeTruthy();
      expect(hintContainer.children.length).toBe(0);
      expect(hintContainer.nativeElement.textContent).toBe('');

      const fxtHint = TestBed.createComponent(WithHintComponent);
      fxtHint.detectChanges();
      await fxtHint.whenStable();

      hintContainer = fxtHint.debugElement.query(By.css('.form-field-hint'));
      expect(hintContainer).toBeTruthy();
      expect(hintContainer.children.length).toBe(1);
      expect(hintContainer.nativeElement.textContent).toBe(`Field's hint`);
    });
  });

  describe('Validation and errors', () => {
    let fixture: ComponentFixture<WithErrorsComponent>;

    beforeEach(async () => {
      fixture = TestBed.createComponent(WithErrorsComponent);
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('Validation classes', async () => {
      const formField = fixture.debugElement.query(By.directive(FormFieldComponent));
      expect(formField.classes['ng-invalid']).toBeTruthy();
      expect(formField.classes['ng-touched']).toBeFalsy();

      const input = formField.query(By.css('input'));
      input.triggerEventHandler('blur');

      fixture.detectChanges();
      await fixture.whenStable();
      expect(formField.classes['ng-invalid']).toBeTruthy();
      expect(formField.classes['ng-touched']).toBeTruthy();

      (input.nativeElement as HTMLInputElement).value = 'foo bar bazz';
      input.triggerEventHandler('input', { target: input.nativeElement });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(formField.classes['ng-invalid']).toBeFalsy();
      expect(formField.classes['ng-touched']).toBeTruthy();
    });

    it('Errors', async () => {
      const fxtNoDisplayedErrors = TestBed.createComponent(NoLabelComponent);
      fxtNoDisplayedErrors.detectChanges();
      await fxtNoDisplayedErrors.whenStable();

      let errorContainer = fxtNoDisplayedErrors.debugElement.query(By.css('.form-field-error'));
      expect(errorContainer).toBeTruthy();
      expect(errorContainer.children.length).toBe(0);

      errorContainer = fixture.debugElement.query(By.css('.form-field-error'));
      expect(errorContainer).toBeTruthy();
      expect(errorContainer.children.length).toBe(1);

      const errors = errorContainer.query(By.directive(ErrorsListComponent));
      expect(errors).toBeTruthy();
      expect(errors.children.length).toBe(1);
      expect(errors.nativeElement.textContent).toBe('This field is required');

      const formField = fixture.debugElement.query(By.directive(FormFieldComponent));
      const input = formField.query(By.css('input'));
      (input.nativeElement as HTMLInputElement).value = 'foo bar bazz';
      input.triggerEventHandler('input', { target: input.nativeElement });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(errors.children.length).toBe(0);
      expect(errors.nativeElement.textContent).toBe('');
    });

    it('Explicit control', async () => {
      const fxtExplicitControl = TestBed.createComponent(WithExplicitControlComponent);
      fxtExplicitControl.detectChanges();
      await fxtExplicitControl.whenStable();

      const formField = fxtExplicitControl.debugElement.query(By.directive(FormFieldComponent));
      expect(formField.classes['ng-invalid']).toBeTruthy();
      expect(fxtExplicitControl.componentInstance.value()).toBe('');

      const input = formField.query(By.css('input'));
      (input.nativeElement as HTMLInputElement).value = 'foo bar bazz';
      input.triggerEventHandler('input', { target: input.nativeElement });
      fxtExplicitControl.detectChanges();
      await fxtExplicitControl.whenStable();

      expect(formField.classes['ng-invalid']).toBeFalsy();
      expect(fxtExplicitControl.componentInstance.value()).toBe('foo bar bazz');
    });
  });

  describe('Warnings', () => {
    let fixture: ComponentFixture<WithWarningsComponent>;
    let component: WithWarningsComponent;

    beforeEach(async () => {
      fixture = TestBed.createComponent(WithWarningsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('Warning container', async () => {
      const fxtNonWarning = TestBed.createComponent(NoLabelComponent);
      fxtNonWarning.detectChanges();
      await fxtNonWarning.whenStable();

      let warningContainer = fxtNonWarning.debugElement
        .query(By.css('.form-field-warning'))
        .query(By.directive(ErrorsListComponent));

      expect(warningContainer).toBeFalsy();

      warningContainer = fixture.debugElement
        .query(By.css('.form-field-warning'))
        .query(By.directive(ErrorsListComponent));

      expect(warningContainer).toBeTruthy();
    });

    it('Not persistent warnings', async () => {
      let formField = fixture.debugElement.query(By.directive(FormFieldComponent));

      const warningContainer = fixture.debugElement
        .query(By.css('.form-field-warning'))
        .query(By.directive(ErrorsListComponent));

      const input = formField.query(By.css('input'));

      expect(formField.classes['step-has-warnings']).toBeFalsy();
      expect(warningContainer.nativeElement.textContent).toBe('');

      getControlWarningsContainer(component.ctrlTestField)!.setWarning('warn', 'This field is important!');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(formField.classes['step-has-warnings']).toBeTruthy();
      expect(warningContainer.nativeElement.textContent).toBe('This field is important!');

      (input.nativeElement as HTMLInputElement).value = 'foo bar bazz';
      input.triggerEventHandler('input', { target: input.nativeElement });
      await firstValueFrom(timer(500));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(formField.classes['step-has-warnings']).toBeFalsy();
      expect(warningContainer.nativeElement.textContent).toBe('');
    });

    it('Persistent warnings', async () => {
      let formField = fixture.debugElement.query(By.directive(FormFieldComponent));

      const warningContainer = fixture.debugElement
        .query(By.css('.form-field-warning'))
        .query(By.directive(ErrorsListComponent));

      const input = formField.query(By.css('input'));

      expect(formField.classes['step-has-warnings']).toBeFalsy();
      expect(warningContainer.nativeElement.textContent).toBe('');

      getControlWarningsContainer(component.ctrlTestField)!.setWarning('warn', 'This field is important!', true);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(formField.classes['step-has-warnings']).toBeTruthy();
      expect(warningContainer.nativeElement.textContent).toBe('This field is important!');

      (input.nativeElement as HTMLInputElement).value = 'foo bar bazz';
      input.triggerEventHandler('input', { target: input.nativeElement });
      await firstValueFrom(timer(500));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(formField.classes['step-has-warnings']).toBeTruthy();
      expect(warningContainer.nativeElement.textContent).toBe('This field is important!');

      getControlWarningsContainer(component.ctrlTestField)!.clearAll();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(formField.classes['step-has-warnings']).toBeFalsy();
      expect(warningContainer.nativeElement.textContent).toBe('');
    });
  });
});
