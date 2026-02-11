import { Component, signal } from '@angular/core';
import { CronModule } from '@exense/step-core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSelectHarness } from '@angular/material/select/testing';

@Component({
  selector: 'step-hours-editor-test',
  imports: [CronModule],
  template: ` <step-hours-editor [isActive]="isActive()" (expressionChange)="expression.set($event)" /> `,
})
class HoursEditorTestComponent {
  readonly isActive = signal(true);
  readonly expression = signal('');
}

describe('HoursEditorComponent', () => {
  let fixture: ComponentFixture<HoursEditorTestComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HoursEditorTestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HoursEditorTestComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
    await fixture.whenStable();
  });

  it('Selection', async () => {
    const selects = await loader.getAllHarnesses(MatSelectHarness);
    expect(selects.length).toBe(3);

    const [hour, minute, second] = selects;
    expect(fixture.componentRef.instance.expression()).toBe('0 0 0/1 1/1 * ? *');

    await hour.open();
    let options = await hour.getOptions();
    expect(options.length).toBe(23);
    await options[16].click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentRef.instance.expression()).toBe('0 0 0/17 1/1 * ? *');

    await minute.open();
    options = await minute.getOptions();
    expect(options.length).toBe(60);
    await options[35].click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentRef.instance.expression()).toBe('0 35 0/17 1/1 * ? *');

    await second.open();
    options = await second.getOptions();
    expect(options.length).toBe(60);
    await options[11].click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentRef.instance.expression()).toBe('11 35 0/17 1/1 * ? *');
  });

  it('Activity', async () => {
    const selects = await loader.getAllHarnesses(MatSelectHarness);
    expect(selects.length).toBe(3);

    let areDisabled = await Promise.all(selects.map((select) => select.isDisabled()));
    expect(areDisabled.every((x) => x)).toBeFalsy();

    fixture.componentInstance.isActive.set(false);
    fixture.detectChanges();
    await fixture.whenStable();

    areDisabled = await Promise.all(selects.map((select) => select.isDisabled()));
    expect(areDisabled.every((x) => x)).toBeTruthy();
  });
});
