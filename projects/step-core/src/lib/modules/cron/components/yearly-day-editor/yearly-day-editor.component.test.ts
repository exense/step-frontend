import { Component, signal } from '@angular/core';
import { CronModule } from '@exense/step-core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSelectHarness } from '@angular/material/select/testing';

@Component({
  selector: 'step-yearly-day-editor-test',
  imports: [CronModule],
  template: ` <step-yearly-day-editor [isActive]="isActive()" (expressionChange)="expression.set($event)" /> `,
})
class YearlyDayEditorTestComponent {
  readonly isActive = signal(true);
  readonly expression = signal('');
}

describe('YearlyDayEditor', () => {
  let fixture: ComponentFixture<YearlyDayEditorTestComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YearlyDayEditorTestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(YearlyDayEditorTestComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
    await fixture.whenStable();
  });

  it('Selection', async () => {
    const selects = await loader.getAllHarnesses(MatSelectHarness);
    expect(selects.length).toBe(5);

    const [month, day, hour, minute, second] = selects;
    expect(fixture.componentRef.instance.expression()).toBe('0 0 0 1W 1 ? *');

    await month.open();
    let options = await month.getOptions();
    expect(options.length).toBe(12);
    await options[2].click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentRef.instance.expression()).toBe('0 0 0 1W 3 ? *');

    await day.open();
    options = await day.getOptions();
    expect(options.length).toBe(34);
    await options[19].click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentRef.instance.expression()).toBe('0 0 0 19 3 ? *');

    await hour.open();
    options = await hour.getOptions();
    expect(options.length).toBe(24);
    await options[16].click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentRef.instance.expression()).toBe('0 0 16 19 3 ? *');

    await minute.open();
    options = await minute.getOptions();
    expect(options.length).toBe(60);
    await options[35].click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentRef.instance.expression()).toBe('0 35 16 19 3 ? *');

    await second.open();
    options = await second.getOptions();
    expect(options.length).toBe(60);
    await options[11].click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentRef.instance.expression()).toBe('11 35 16 19 3 ? *');
  });

  it('Activity', async () => {
    const selects = await loader.getAllHarnesses(MatSelectHarness);
    expect(selects.length).toBe(5);

    let areDisabled = await Promise.all(selects.map((select) => select.isDisabled()));
    expect(areDisabled.every((x) => x)).toBeFalsy();

    fixture.componentInstance.isActive.set(false);
    fixture.detectChanges();
    await fixture.whenStable();

    areDisabled = await Promise.all(selects.map((select) => select.isDisabled()));
    expect(areDisabled.every((x) => x)).toBeTruthy();
  });
});
