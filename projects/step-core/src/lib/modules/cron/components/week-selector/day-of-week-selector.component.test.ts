import { Component, model, signal } from '@angular/core';
import { CronModule } from '@exense/step-core';
import { FormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';

@Component({
  selector: 'step-day-of-week-selector-test',
  imports: [CronModule, FormsModule],
  template: ` <step-day-of-week-selector [(ngModel)]="weeks" [disabled]="isDisabled()" /> `,
})
export class DayOfWeekSelectorTestComponent {
  readonly weeks = model<string[] | undefined>(undefined);
  readonly isDisabled = signal(false);
}

describe('DayOfWeekSelectorComponent', () => {
  let fixture: ComponentFixture<DayOfWeekSelectorTestComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DayOfWeekSelectorTestComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(DayOfWeekSelectorTestComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('Model changes', async () => {
    const checkboxes = await loader.getAllHarnesses(MatCheckboxHarness);
    expect(checkboxes.length).toBe(7);
    expect(fixture.componentInstance.weeks()).toBeUndefined();

    await checkboxes[0].check();
    expect(fixture.componentInstance.weeks()).toEqual(['MON']);

    await checkboxes[1].check();
    expect(fixture.componentInstance.weeks()).toEqual(['MON', 'TUE']);

    await checkboxes[2].check();
    expect(fixture.componentInstance.weeks()).toEqual(['MON', 'TUE', 'WED']);

    await checkboxes[3].check();
    expect(fixture.componentInstance.weeks()).toEqual(['MON', 'TUE', 'WED', 'THU']);

    await checkboxes[4].check();
    expect(fixture.componentInstance.weeks()).toEqual(['MON', 'TUE', 'WED', 'THU', 'FRI']);

    await checkboxes[5].check();
    expect(fixture.componentInstance.weeks()).toEqual(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']);

    await checkboxes[6].check();
    expect(fixture.componentInstance.weeks()).toEqual(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']);

    await checkboxes[0].uncheck();
    expect(fixture.componentInstance.weeks()).toEqual(['TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']);

    await checkboxes[1].uncheck();
    expect(fixture.componentInstance.weeks()).toEqual(['WED', 'THU', 'FRI', 'SAT', 'SUN']);

    await checkboxes[2].uncheck();
    expect(fixture.componentInstance.weeks()).toEqual(['THU', 'FRI', 'SAT', 'SUN']);

    await checkboxes[3].uncheck();
    expect(fixture.componentInstance.weeks()).toEqual(['FRI', 'SAT', 'SUN']);

    await checkboxes[4].uncheck();
    expect(fixture.componentInstance.weeks()).toEqual(['SAT', 'SUN']);

    await checkboxes[5].uncheck();
    expect(fixture.componentInstance.weeks()).toEqual(['SUN']);

    await checkboxes[6].uncheck();
    expect(fixture.componentInstance.weeks()).toEqual([]);
  });

  it('Enable disable', async () => {
    const checkboxes = await loader.getAllHarnesses(MatCheckboxHarness);
    expect(checkboxes.length).toBe(7);

    let areAllDisabled = await Promise.all(checkboxes.map((el) => el.isDisabled()));
    expect(areAllDisabled.every((x) => !x)).toBeTruthy();

    fixture.componentInstance.isDisabled.set(true);
    areAllDisabled = await Promise.all(checkboxes.map((el) => el.isDisabled()));
    expect(areAllDisabled.every((x) => x)).toBeTruthy();
  });
});
