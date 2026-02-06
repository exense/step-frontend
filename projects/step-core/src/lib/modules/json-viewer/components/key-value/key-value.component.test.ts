import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JsonViewerModule, KeyValueComponent } from '@exense/step-core';

describe('KeyValueComponent', () => {
  let fixture: ComponentFixture<KeyValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JsonViewerModule],
    }).compileComponents();

    fixture = TestBed.createComponent(KeyValueComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('Rendering', async () => {
    expect(fixture.debugElement.children.length).toBe(0);
    fixture.componentRef.setInput('json', {
      foo: 'FOO',
      bar: 'BAR',
      baz: 'BAZ',
      subItem: { item_1: 1, item_2: 2, item_3: 3 },
    });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.debugElement.children.length).toBe(4);
    expect(fixture.debugElement.children[0].nativeElement.textContent).toBe('foo = FOO');
    expect(fixture.debugElement.children[1].nativeElement.textContent).toBe('bar = BAR');
    expect(fixture.debugElement.children[2].nativeElement.textContent).toBe('baz = BAZ');
    expect(fixture.debugElement.children[3].nativeElement.textContent).toBe(
      'subItem = {"item_1":1,"item_2":2,"item_3":3}',
    );
    fixture.componentRef.setInput('json', {
      abc: 'ABC',
      def: 'DEF',
    });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.debugElement.children.length).toBe(2);
    expect(fixture.debugElement.children[0].nativeElement.textContent).toBe('abc = ABC');
    expect(fixture.debugElement.children[1].nativeElement.textContent).toBe('def = DEF');
  });
});
