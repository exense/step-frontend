import { Component, signal } from '@angular/core';
import { CRON_PRESETS, CronModule } from '@exense/step-core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatRadioButtonHarness } from '@angular/material/radio/testing';

@Component({
  selector: 'step-preset-editor-test',
  imports: [CronModule],
  template: `<step-preset-editor [isActive]="isActive()" (expressionChange)="expression.set($event)" />`,
})
class PresetEditorTestComponent {
  readonly isActive = signal(true);
  readonly expression = signal('');
}

describe('PresetEditorComponent', () => {
  let fixture: ComponentFixture<PresetEditorTestComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresetEditorTestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PresetEditorTestComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('Selection', async () => {
    const presets = TestBed.inject(CRON_PRESETS);
    const radioButtons = await loader.getAllHarnesses(MatRadioButtonHarness);
    expect(radioButtons.length).toBe(presets.length);

    for (let i = 0; i < radioButtons.length; i++) {
      const radioButton = radioButtons[i];
      await radioButton.check();
      expect(fixture.componentInstance.expression()).toBe(presets[i].key);
    }
  });

  it('Activity', async () => {
    const radioButtons = await loader.getAllHarnesses(MatRadioButtonHarness);

    let areDisabled = await Promise.all(radioButtons.map((radio) => radio.isDisabled()));
    expect(areDisabled.every((x) => x)).toBeFalsy();

    fixture.componentInstance.isActive.set(false);
    fixture.detectChanges();
    await fixture.whenStable();

    areDisabled = await Promise.all(radioButtons.map((radio) => radio.isDisabled()));
    expect(areDisabled.every((x) => x)).toBeTruthy();
  });
});
