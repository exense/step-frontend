import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JsonViewerModule, PrettyPrintInlineComponent } from '@exense/step-core';

describe('PrettyPrintInlineComponent', () => {
  let fixture: ComponentFixture<PrettyPrintInlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JsonViewerModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PrettyPrintInlineComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('Rendering', async () => {
    expect(fixture.debugElement.nativeElement.textContent).toBe('\n');

    fixture.componentRef.setInput('json', {
      foo: 'FOO',
      bar: 'BAR',
      baz: 'BAZ',
      subItem: { item_1: 1, item_2: 2, item_3: 3 },
    });

    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.debugElement.nativeElement.textContent).toBe(
      `{
  "foo": "FOO",
  "bar": "BAR",
  "baz": "BAZ",
  "subItem": {
    "item_1": 1,
    "item_2": 2,
    "item_3": 3
  }
`,
    );

    fixture.componentRef.setInput('maxChars', 10);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.debugElement.nativeElement.textContent).toBe(
      `{
  "foo":...
`,
    );
  });
});
