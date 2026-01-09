import { Component, inject, signal } from '@angular/core';
import { StepBasicsModule } from '@exense/step-core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

@Component({
  selector: 'step-test-password',
  imports: [StepBasicsModule, ReactiveFormsModule],
  template: `<step-password [formControl]="passwordCtrl" [placeholder]="passwordPlaceholder()" />`,
})
class PasswordComponentTestWrapperComponent {
  private _fb = inject(FormBuilder).nonNullable;
  readonly passwordCtrl = this._fb.control('');
  readonly passwordPlaceholder = signal<string | undefined>(undefined);
}

describe('PasswordComponent', () => {
  let component: PasswordComponentTestWrapperComponent;
  let fixture: ComponentFixture<PasswordComponentTestWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordComponentTestWrapperComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordComponentTestWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('input value', async () => {
    expect(component.passwordCtrl.value).toBe('');
    let passwordInput = fixture.nativeElement.querySelector('input.password-input');
    expect(passwordInput).toBeTruthy();
    expect(passwordInput.value).toBe('');

    component.passwordCtrl.setValue('foo bar bazz');
    fixture.detectChanges();
    await fixture.whenStable();
    passwordInput = fixture.nativeElement.querySelector('input.password-input');
    expect(passwordInput).toBeTruthy();
    expect(passwordInput.value).toBe('foo bar bazz');
  });

  it('toggle password visibility', async () => {
    component.passwordCtrl.setValue('foo bar bazz');
    fixture.detectChanges();
    await fixture.whenStable();

    let passwordInput = fixture.nativeElement.querySelector('input.password-input');
    expect(passwordInput).toBeTruthy();
    expect(passwordInput.value).toBe('foo bar bazz');
    expect(passwordInput.type).toBe('password');

    let visibilityIcon = fixture.debugElement.query(By.css('step-icon.eye-icon'));
    expect(visibilityIcon).toBeTruthy();
    expect(visibilityIcon.componentInstance.name).toBe('eye');

    visibilityIcon.triggerEventHandler('click', null);
    fixture.detectChanges();
    await fixture.whenStable();

    passwordInput = fixture.nativeElement.querySelector('input.password-input');
    expect(passwordInput).toBeTruthy();
    expect(passwordInput.value).toBe('foo bar bazz');
    expect(passwordInput.type).toBe('text');

    visibilityIcon = fixture.debugElement.query(By.css('step-icon.eye-icon'));
    expect(visibilityIcon).toBeTruthy();
    expect(visibilityIcon.componentInstance.name).toBe('eye-off');

    visibilityIcon.triggerEventHandler('click', null);
    fixture.detectChanges();
    await fixture.whenStable();

    passwordInput = fixture.nativeElement.querySelector('input.password-input');
    expect(passwordInput).toBeTruthy();
    expect(passwordInput.value).toBe('foo bar bazz');
    expect(passwordInput.type).toBe('password');

    visibilityIcon = fixture.debugElement.query(By.css('step-icon.eye-icon'));
    expect(visibilityIcon).toBeTruthy();
    expect(visibilityIcon.componentInstance.name).toBe('eye');
  });
});
