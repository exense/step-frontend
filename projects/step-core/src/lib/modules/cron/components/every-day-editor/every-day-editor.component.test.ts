import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { CronModule } from '@exense/step-core';
import { Component, signal } from '@angular/core';
import { MatSelectHarness } from '@angular/material/select/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';

@Component({
  selector: 'step-every-day-editor-test',
  imports: [CronModule],
  template: ` <step-every-day-editor [isActive]="isActive()" (expressionChange)="expression.set($event)" /> `,
})
class EveryDayEditorComponentTestComponent {
  readonly isActive = signal(true);
  readonly expression = signal('');
}

describe('EveryDayEditorComponent', () => {
  let fixture: ComponentFixture<EveryDayEditorComponentTestComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EveryDayEditorComponentTestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EveryDayEditorComponentTestComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
    await fixture.whenStable();
  });

  it('Selection', async () => {
    const selects = await loader.getAllHarnesses(MatSelectHarness);
    expect(selects.length).toBe(4);

    const [day, hour, minute, second] = selects;
    expect(fixture.componentRef.instance.expression()).toBe('0 0 0 1/1 * ? *');

    await day.open();
    let options = await day.getOptions();
    expect(options.length).toBe(31);
    await options[19].click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentRef.instance.expression()).toBe('0 0 0 1/20 * ? *');

    await hour.open();
    options = await hour.getOptions();
    expect(options.length).toBe(24);
    await options[16].click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentRef.instance.expression()).toBe('0 0 16 1/20 * ? *');

    await minute.open();
    options = await minute.getOptions();
    expect(options.length).toBe(60);
    await options[35].click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentRef.instance.expression()).toBe('0 35 16 1/20 * ? *');

    await second.open();
    options = await second.getOptions();
    expect(options.length).toBe(60);
    await options[11].click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentRef.instance.expression()).toBe('11 35 16 1/20 * ? *');
  });

  it('Activity', async () => {
    const selects = await loader.getAllHarnesses(MatSelectHarness);
    expect(selects.length).toBe(4);

    let areDisabled = await Promise.all(selects.map((select) => select.isDisabled()));
    expect(areDisabled.every((x) => x)).toBeFalsy();

    fixture.componentInstance.isActive.set(false);
    fixture.detectChanges();
    await fixture.whenStable();

    areDisabled = await Promise.all(selects.map((select) => select.isDisabled()));
    expect(areDisabled.every((x) => x)).toBeTruthy();
  });
});
