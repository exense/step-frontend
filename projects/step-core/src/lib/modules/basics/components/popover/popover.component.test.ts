import { Component, signal } from '@angular/core';
import { PopoverMode, StepBasicsModule, StepIconsModule } from '@exense/step-core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { PopoverHarness } from './popover-harness';

@Component({
  selector: 'step-popover-test',
  imports: [StepBasicsModule, StepIconsModule],
  template: `<step-popover [mode]="popoverMode()" (toggledEvent)="isPopoverToggled.set($event)">
    <step-icon name="help-circle" />
    <step-popover-content>
      <div class="popover-content">Test test test</div>
    </step-popover-content>
  </step-popover>`,
})
class PopoverTestComponent {
  protected readonly popoverMode = signal(PopoverMode.HOVER);
  protected readonly isPopoverToggled = signal(false);

  /* eslint-disable step-lint/component-public-fields -- Test host exposes controls and observed output to assertions. */
  setPopoverMode(mode: PopoverMode): void {
    this.popoverMode.set(mode);
  }

  getIsPopoverToggled(): boolean {
    return this.isPopoverToggled();
  }
  /* eslint-enable step-lint/component-public-fields */
}

describe('PopoverComponent', () => {
  let fixture: ComponentFixture<PopoverTestComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopoverTestComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(PopoverTestComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  const wait = async (ms: number): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, ms));
    await fixture.whenStable();
  };

  it('Hover mode and popover content', async () => {
    const popover = await loader.getHarness(PopoverHarness);
    const popoverIcon = await popover.getTriggerContent('step-icon');
    const iconName = await popoverIcon.getAttribute('name');
    expect(iconName).toBe('help-circle');

    let contentItems = await popover.getPopoverContent('.popover-content');
    expect(contentItems.length).toBe(0);

    await popover.click();
    contentItems = await popover.getPopoverContent('.popover-content');
    expect(contentItems.length).toBe(0);

    await popover.mouseEnter();
    await wait(350);
    contentItems = await popover.getPopoverContent('.popover-content');
    expect(contentItems.length).toBe(1);
    const content = await contentItems[0].text();
    expect(content).toEqual('Test test test');

    await popover.mouseLeave();
    await wait(450);
    contentItems = await popover.getPopoverContent('.popover-content');
    expect(contentItems.length).toBe(0);
  });

  it('Click mode', async () => {
    fixture.componentInstance.setPopoverMode(PopoverMode.CLICK);
    const popover = await loader.getHarness(PopoverHarness);

    let isOpened = await popover.isPopoverOpened();
    expect(isOpened).toBeFalsy();

    await popover.mouseEnter();
    isOpened = await popover.isPopoverOpened();
    expect(isOpened).toBeFalsy();

    await popover.click();
    isOpened = await popover.isPopoverOpened();
    expect(isOpened).toBeTruthy();
    expect(fixture.componentInstance.getIsPopoverToggled()).toBeTruthy();

    await popover.mouseLeave();
    isOpened = await popover.isPopoverOpened();
    expect(isOpened).toBeTruthy();

    await popover.pressEscape();
    isOpened = await popover.isPopoverOpened();
    expect(isOpened).toBeFalsy();
    expect(fixture.componentInstance.getIsPopoverToggled()).toBeFalsy();

    await popover.click();
    isOpened = await popover.isPopoverOpened();
    expect(isOpened).toBeTruthy();

    await popover.pressEscape();
    isOpened = await popover.isPopoverOpened();
    expect(isOpened).toBeFalsy();
    expect(fixture.componentInstance.getIsPopoverToggled()).toBeFalsy();
  });

  it('Both mode', async () => {
    fixture.componentInstance.setPopoverMode(PopoverMode.BOTH);
    const popover = await loader.getHarness(PopoverHarness);

    let isOpened = await popover.isPopoverOpened();
    expect(isOpened).toBeFalsy();

    await popover.mouseEnter();
    await wait(350);
    isOpened = await popover.isPopoverOpened();
    expect(isOpened).toBeTruthy();

    await popover.mouseLeave();
    await wait(450);
    isOpened = await popover.isPopoverOpened();
    expect(isOpened).toBeFalsy();

    await popover.mouseEnter();
    await wait(350);
    isOpened = await popover.isPopoverOpened();
    expect(isOpened).toBeTruthy();
    await popover.click();
    await popover.mouseLeave();
    isOpened = await popover.isPopoverOpened();
    expect(isOpened).toBeTruthy();

    await popover.backdropClick();
    isOpened = await popover.isPopoverOpened();
    expect(isOpened).toBeFalsy();
  });
});
