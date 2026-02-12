import { CustomComponent, CustomItemRenderComponent } from '@exense/step-core';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

interface TestContext {
  foo?: string;
  bar?: string;
}

class ContextChangeHandler {
  protected constructor() {}

  static readonly instance = new ContextChangeHandler();

  contextChange(previousContext?: TestContext, currentContext?: TestContext): void {}
}

@Component({
  selector: 'step-test-component',
  template: `
    <div id="foo">{{ context?.foo }}</div>
    <div id="bar">{{ context?.bar }}</div>
  `,
})
class TestComponent implements CustomComponent {
  context?: TestContext;

  contextChange(previousContext?: TestContext, currentContext?: TestContext): void {
    ContextChangeHandler.instance.contextChange(previousContext, currentContext);
  }
}

describe('CustomItemRenderComponent', () => {
  let fixture: ComponentFixture<CustomItemRenderComponent>;
  let contextChangeSpy: jest.SpyInstance;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
      declarations: [CustomItemRenderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomItemRenderComponent);
    contextChangeSpy = jest.spyOn(ContextChangeHandler.instance, 'contextChange');
    contextChangeSpy.mockReset();

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('Rendering', async () => {
    let elementFoo = fixture.debugElement.query(By.css('#foo'));
    let elementBar = fixture.debugElement.query(By.css('#bar'));
    expect(elementFoo).toBeFalsy();
    expect(elementBar).toBeFalsy();

    fixture.componentRef.setInput('component', TestComponent);
    fixture.detectChanges();

    elementFoo = fixture.debugElement.query(By.css('#foo'));
    elementBar = fixture.debugElement.query(By.css('#bar'));
    expect(elementFoo).toBeTruthy();
    expect(elementFoo.nativeElement.innerHTML).toBe('');
    expect(elementBar).toBeTruthy();
    expect(elementBar.nativeElement.innerHTML).toBe('');

    fixture.componentRef.setInput('context', { foo: 'FOO', bar: 'BAR' } as TestContext);
    fixture.detectChanges();

    expect(elementFoo.nativeElement.innerHTML).toBe('FOO');
    expect(elementBar.nativeElement.innerHTML).toBe('BAR');

    fixture.componentRef.setInput('context', { foo: 'aaa', bar: 'bbb' } as TestContext);
    fixture.detectChanges();

    expect(elementFoo.nativeElement.innerHTML).toBe('aaa');
    expect(elementBar.nativeElement.innerHTML).toBe('bbb');

    fixture.componentRef.setInput('context', undefined);
    fixture.detectChanges();

    expect(elementFoo.nativeElement.innerHTML).toBe('');
    expect(elementBar.nativeElement.innerHTML).toBe('');
  });

  it('Context change handler', () => {
    fixture.componentRef.setInput('component', TestComponent);
    fixture.detectChanges();

    expect(contextChangeSpy).not.toHaveBeenCalled();
    const context1: TestContext = { foo: 'FOO', bar: 'BAR' };
    const context2: TestContext = { foo: 'aaa', bar: 'bbb' };

    fixture.componentRef.setInput('context', context1);
    fixture.detectChanges();

    expect(contextChangeSpy).toHaveBeenCalledWith(undefined, context1);

    contextChangeSpy.mockReset();
    expect(contextChangeSpy).not.toHaveBeenCalled();
    fixture.componentRef.setInput('context', context1);
    fixture.detectChanges();
    expect(contextChangeSpy).not.toHaveBeenCalled();

    fixture.componentRef.setInput('context', context2);
    fixture.detectChanges();

    expect(contextChangeSpy).toHaveBeenCalledWith(context1, context2);
  });
});
