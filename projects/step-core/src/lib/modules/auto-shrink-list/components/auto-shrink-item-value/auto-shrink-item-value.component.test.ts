import { Component, Directive, signal } from '@angular/core';
import { KeyValue } from '@angular/common';
import { AutoShrinkItemValueComponent } from '@exense/step-core';
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
  imports: [AutoShrinkItemValueComponent],
  template: `
    @if (item(); as item) {
      <step-auto-shrink-item-value [item]="item" [emptyValueTemplate]="test" />
    }
    <ng-template #test>
      <div class="test">EMPTY</div>
    </ng-template>
  `,
})
class AutoShrinkItemValueWithTemplateComponent extends AutoShrinkItemValueBaseComponent {}

describe('AutoShrinkItemValueComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoShrinkItemValueWithoutTemplateComponent, AutoShrinkItemValueWithTemplateComponent],
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
});
