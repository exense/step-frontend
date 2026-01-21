import { Component, signal } from '@angular/core';
import { CronModule } from '@exense/step-core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSelectHarness } from '@angular/material/select/testing';

@Component({
  selector: 'step-monthly-week-editor-test',
  imports: [CronModule],
  template: ` <step-monthly-week-editor [isActive]="isActive()" (expressionChange)="expression.set($event)" /> `,
})
class MonthlyWeekEditorTestComponent {
  readonly isActive = signal(true);
  readonly expression = signal('');
}

describe('MonthlyWeekEditorComponent', () => {
  let fixture: ComponentFixture<MonthlyWeekEditorTestComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyWeekEditorTestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MonthlyWeekEditorTestComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
    await fixture.whenStable();
  });

  it('Selection', async () => {
    const selects = await loader.getAllHarnesses(MatSelectHarness);
    expect(selects.length).toBe(6);

    const [dayNum, weekDay, month, hour, minute, second] = selects;
    expect(fixture.componentRef.instance.expression()).toBe('0 0 0 ? 1/1 MON#1 *');

    await dayNum.open();
    let options = await dayNum.getOptions();
    expect(options.length).toBe(6);
    await options[5].click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentRef.instance.expression()).toBe('0 0 0 ? 1/1 MONL *');

    await weekDay.open();
    options = await weekDay.getOptions();
    expect(options.length).toBe(7);
    await options[3].click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentRef.instance.expression()).toBe('0 0 0 ? 1/1 THUL *');

    await month.open();
    options = await month.getOptions();
    expect(options.length).toBe(12);
    await options[3].click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentRef.instance.expression()).toBe('0 0 0 ? 1/4 THUL *');

    await hour.open();
    options = await hour.getOptions();
    expect(options.length).toBe(24);
    await options[16].click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentRef.instance.expression()).toBe('0 0 16 ? 1/4 THUL *');

    await minute.open();
    options = await minute.getOptions();
    expect(options.length).toBe(60);
    await options[35].click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentRef.instance.expression()).toBe('0 35 16 ? 1/4 THUL *');

    await second.open();
    options = await second.getOptions();
    expect(options.length).toBe(61);
    await options[11].click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentRef.instance.expression()).toBe('10 35 16 ? 1/4 THUL *');
  });

  it('Activity', async () => {
    const selects = await loader.getAllHarnesses(MatSelectHarness);
    expect(selects.length).toBe(6);

    let areDisabled = await Promise.all(selects.map((select) => select.isDisabled()));
    expect(areDisabled.every((x) => x)).toBeFalsy();

    fixture.componentInstance.isActive.set(false);
    fixture.detectChanges();
    await fixture.whenStable();

    areDisabled = await Promise.all(selects.map((select) => select.isDisabled()));
    expect(areDisabled.every((x) => x)).toBeTruthy();
  });
});
