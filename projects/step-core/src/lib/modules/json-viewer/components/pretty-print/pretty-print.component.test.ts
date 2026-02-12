import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JsonViewerModule, PrettyPrintComponent } from '@exense/step-core';
import { By } from '@angular/platform-browser';

describe('PrettyPrintComponent', () => {
  let fixture: ComponentFixture<PrettyPrintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JsonViewerModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PrettyPrintComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('Rendering', async () => {
    const pre = fixture.debugElement.query(By.css('pre'));
    expect(pre.nativeElement.textContent).toBe('');

    fixture.componentRef.setInput('json', {
      foo: 'FOO',
      bar: 'BAR',
      baz: 'BAZ',
      subItem: { item_1: 1, item_2: 2, item_3: 3 },
    });

    fixture.detectChanges();
    await fixture.whenStable();

    expect(pre.nativeElement.textContent).toBe(
      `{
  "foo": "FOO",
  "bar": "BAR",
  "baz": "BAZ",
  "subItem": {
    "item_1": 1,
    "item_2": 2,
    "item_3": 3
  }
}`,
    );
  });
});
