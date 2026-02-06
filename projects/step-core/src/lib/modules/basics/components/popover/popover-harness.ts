import { ComponentHarness, TestElement } from '@angular/cdk/testing';

export class PopoverHarness extends ComponentHarness {
  static hostSelector = 'step-popover';

  private documentRootLocator = this.documentRootLocatorFactory();

  async getTriggerContent(selector: string): Promise<TestElement> {
    return this.locatorFor(`.trigger-wrapper ${selector}`)();
  }

  getPopoverContent(selector: string): Promise<TestElement[]> {
    return this.documentRootLocator.locatorForAll(`step-popover-content ${selector}`)();
  }

  async isPopoverOpened(): Promise<boolean> {
    const content = await this.documentRootLocator.locatorForAll(`step-popover-content`)();
    return content.length > 0;
  }

  async mouseEnter(): Promise<void> {
    const triggerWrapper = await this.getTriggerWrapper();
    await triggerWrapper.hover();
  }

  async mouseLeave(): Promise<void> {
    const triggerWrapper = await this.getTriggerWrapper();
    await triggerWrapper.mouseAway();
  }

  async click(): Promise<void> {
    const triggerWrapper = await this.getTriggerWrapper();
    await triggerWrapper.click();
  }

  async backdropClick(): Promise<void> {
    const backdrop = await this.documentRootLocator.locatorFor('.cdk-overlay-backdrop')();
    await backdrop.click();
  }

  private async getTriggerWrapper(): Promise<TestElement> {
    return await this.locatorFor('.trigger-wrapper')();
  }
}
