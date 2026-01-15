import { Component, signal } from '@angular/core';
import { CronModule } from '@exense/step-core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSelectHarness } from '@angular/material/select/testing';

@Component({
  selector: 'step-minutes-editor-test',
  imports: [CronModule],
  template: ` <step-minutes-editor [isActive]="isActive()" (expressionChange)="expression.set($event)" /> `,
})
class MinutesEditorTestComponent {
  readonly isActive = signal(true);
  readonly expression = signal('');
}

describe('MinutesEditorComponent', () => {
  let fixture: ComponentFixture<MinutesEditorTestComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinutesEditorTestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MinutesEditorTestComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
    await fixture.whenStable();
  });

  it('Selection', async () => {
    const selects = await loader.getAllHarnesses(MatSelectHarness);
    expect(selects.length).toBe(2);

    const [minute, second] = selects;
    expect(fixture.componentRef.instance.expression()).toBe('0 0/1 * 1/1 * ? *');

    await minute.open();
    let options = await minute.getOptions();
    expect(options.length).toBe(59);
    await options[34].click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentRef.instance.expression()).toBe('0 0/35 * 1/1 * ? *');

    await second.open();
    options = await second.getOptions();
    expect(options.length).toBe(60);
    await options[11].click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentRef.instance.expression()).toBe('11 0/35 * 1/1 * ? *');
  });

  it('Activity', async () => {
    const selects = await loader.getAllHarnesses(MatSelectHarness);
    expect(selects.length).toBe(2);

    let areDisabled = await Promise.all(selects.map((select) => select.isDisabled()));
    expect(areDisabled.every((x) => x)).toBeFalsy();

    fixture.componentInstance.isActive.set(false);
    fixture.detectChanges();
    await fixture.whenStable();

    areDisabled = await Promise.all(selects.map((select) => select.isDisabled()));
    expect(areDisabled.every((x) => x)).toBeTruthy();
  });
});
