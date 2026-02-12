import { ErrorsListComponent } from '@exense/step-core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';

describe('ErrorListComponent', () => {
  let fixture: ComponentFixture<ErrorsListComponent>;
  let component: ErrorsListComponent;
  let componentRef: ComponentRef<ErrorsListComponent>;

  const getTexts = () => {
    const result: string[] = [];
    const divTexts = fixture.nativeElement.querySelectorAll('div');
    divTexts?.forEach?.((item: HTMLHtmlElement) => result.push(item.textContent ?? ''));
    return result;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ErrorsListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorsListComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('Error list without dictionary', async () => {
    componentRef.setInput('errors', {
      foo: 'errFoo',
      bar: 'errBar',
      bazz: 'errBazz',
    });

    fixture.detectChanges();
    await fixture.whenStable();

    let divTexts = getTexts();
    expect(divTexts.length).toBe(3);
    expect(divTexts).toEqual(['errFoo', 'errBar', 'errBazz']);

    componentRef.setInput('errors', {
      aaa: 'errAaa',
      bbb: 43,
      ccc: 'errCcc',
    });

    fixture.detectChanges();
    await fixture.whenStable();

    divTexts = getTexts();
    expect(divTexts.length).toBe(2);
    expect(divTexts).toEqual(['errAaa', 'errCcc']);
  });

  it('Error list with dictionary', async () => {
    componentRef.setInput('keysDictionary', {
      foo: 'This is error foo',
      bazz: 'This is error bazz',
      aaa: 'This is error aaa',
      bbb: 'This is error bbb',
      ddd: 'This is error ddd',
    });

    componentRef.setInput('errors', {
      foo: 'errFoo',
      bar: 'errBar',
      bazz: 'errBazz',
    });

    fixture.detectChanges();
    await fixture.whenStable();

    let divTexts = getTexts();
    expect(divTexts.length).toBe(3);
    expect(divTexts).toEqual(['This is error foo', 'errBar', 'This is error bazz']);

    componentRef.setInput('errors', {
      aaa: 'errAaa',
      bbb: 43,
      ccc: 'errCcc',
      ddd: 'errDdd',
    });

    fixture.detectChanges();
    await fixture.whenStable();

    divTexts = getTexts();
    expect(divTexts.length).toBe(4);
    expect(divTexts).toEqual(['This is error aaa', 'This is error bbb', 'errCcc', 'This is error ddd']);
  });
});
