import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicValue, JsonViewerModule, KeyValueInlineComponent } from '@exense/step-core';
import { By } from '@angular/platform-browser';

describe('KeyValueInlineComponent', () => {
  let fixture: ComponentFixture<KeyValueInlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JsonViewerModule],
    }).compileComponents();

    fixture = TestBed.createComponent(KeyValueInlineComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('Ordinary rendering', async () => {
    const element = fixture.debugElement.query(By.css('.key-value-item'));
    expect(element.nativeElement.textContent).toBe('');

    fixture.componentRef.setInput('json', {
      foo: 'FOO',
      bar: 'BAR',
      baz: 'BAZ',
      subItem: { item_1: 1, item_2: 2, item_3: 3 },
    });

    fixture.detectChanges();
    await fixture.whenStable();

    expect(element.nativeElement.textContent.trim()).toEqual(
      'foo = FOO  ¦ bar = BAR  ¦ baz = BAZ  ¦ subItem = {"item_1":1,"item_2":2,"item_3":3}',
    );

    fixture.componentRef.setInput('maxChars', 10);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(element.nativeElement.textContent.trim()).toEqual('foo = FOO ...');
  });

  it('Dynamic value rendering', async () => {
    const element = fixture.debugElement.query(By.css('.key-value-item'));
    expect(element.nativeElement.textContent).toBe('');

    fixture.componentRef.setInput('json', {
      foo: 'FOO',
      bar: { value: 'BAR', dynamic: false, expression: undefined } as DynamicValue,
      baz: { value: undefined, dynamic: true, expression: 'BAZ' } as DynamicValue,
    });

    fixture.detectChanges();
    await fixture.whenStable();

    expect(element.nativeElement.textContent.trim()).toEqual('foo = FOO  ¦ bar = BAR  ¦ baz = BAZ');
  });
});
