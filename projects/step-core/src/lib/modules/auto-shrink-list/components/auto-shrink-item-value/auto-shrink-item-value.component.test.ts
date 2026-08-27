import { Component, Directive, signal, viewChild } from '@angular/core';
import { KeyValue } from '@angular/common';
import {
  AutoShrinkEmptyValueTemplateDirective,
  AutoShrinkItemActionTemplateDirective,
  AutoShrinkItemValueComponent,
} from '@exense/step-core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

@Directive()
abstract class AutoShrinkItemValueBaseComponent {
  readonly item = signal<KeyValue<string, string>>({ key: '', value: '' });
}

@Component({
  selector: 'step-auto-shrink-item-value-without-template-test',
  imports: [AutoShrinkItemValueComponent],
  template: `
    @if (item(); as item) {
      <step-auto-shrink-item-value [item]="item" />
    }
  `,
})
class AutoShrinkItemValueWithoutTemplateComponent extends AutoShrinkItemValueBaseComponent {}

@Component({
  selector: 'step-auto-shrink-item-value-with-template-test',
  imports: [AutoShrinkEmptyValueTemplateDirective, AutoShrinkItemValueComponent],
  template: `
    @if (item(); as item) {
      <step-auto-shrink-item-value [item]="item" [emptyValue]="emptyValue()" />
    }
    <ng-template stepAutoShrinkEmptyValueTemplate>
      <div class="test">EMPTY</div>
    </ng-template>
  `,
})
class AutoShrinkItemValueWithTemplateComponent extends AutoShrinkItemValueBaseComponent {
  protected readonly emptyValue = viewChild(AutoShrinkEmptyValueTemplateDirective);
}

@Component({
  selector: 'step-auto-shrink-item-value-with-action-template-test',
  imports: [AutoShrinkItemActionTemplateDirective, AutoShrinkItemValueComponent],
  template: `
    @if (item(); as item) {
      <step-auto-shrink-item-value [item]="item" [itemAction]="itemAction()" />
    }
    <ng-template stepAutoShrinkItemActionTemplate let-item>
      <button type="button" class="test">Copy {{ item.value }}</button>
    </ng-template>
  `,
})
class AutoShrinkItemValueWithActionTemplateComponent extends AutoShrinkItemValueBaseComponent {
  protected readonly itemAction = viewChild(AutoShrinkItemActionTemplateDirective);
}

describe('AutoShrinkItemValueComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AutoShrinkItemValueWithoutTemplateComponent,
        AutoShrinkItemValueWithTemplateComponent,
        AutoShrinkItemValueWithActionTemplateComponent,
      ],
    }).compileComponents();
  });

  it('Without empty template', async () => {
    let fixture = TestBed.createComponent(AutoShrinkItemValueWithoutTemplateComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).innerText.trim()).toBe('');
    fixture.componentInstance.item.set({ key: 'foo', value: 'FOO' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).innerText.trim()).toBe('FOO');
  });

  it('With empty template', async () => {
    let fixture = TestBed.createComponent(AutoShrinkItemValueWithTemplateComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    let emptyContainer = fixture.debugElement.query(By.css('.test'));
    expect(emptyContainer).not.toBeNull();
    expect((emptyContainer.nativeElement as HTMLElement).innerText).toBe('EMPTY');

    fixture.componentInstance.item.set({ key: 'foo', value: 'FOO' });
    fixture.detectChanges();
    await fixture.whenStable();

    emptyContainer = fixture.debugElement.query(By.css('.test'));
    expect(emptyContainer).toBeNull();
    expect((fixture.nativeElement as HTMLElement).innerText.trim()).toBe('FOO');
  });

  it('With action template', async () => {
    const fixture = TestBed.createComponent(AutoShrinkItemValueWithActionTemplateComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect((fixture.debugElement.query(By.css('.test')).nativeElement as HTMLElement).innerText.trim()).toBe('Copy');

    fixture.componentInstance.item.set({ key: 'foo', value: 'FOO' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect((fixture.debugElement.query(By.css('.test')).nativeElement as HTMLElement).innerText.trim()).toBe(
      'Copy FOO',
    );
  });
});
