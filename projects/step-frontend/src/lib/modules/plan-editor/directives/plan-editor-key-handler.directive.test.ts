import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AuthService, PlanEditorService, PlanInteractiveSessionService } from '@exense/step-core';
import { PlanEditorKeyHandlerDirective } from './plan-editor-key-handler.directive';

@Component({
  selector: 'step-interactive-shortcut-test',
  template: '<div stepPlanEditorKeyHandler></div>',
  standalone: false,
})
class ShortcutHostComponent {}

describe('Interactive execution shortcut', () => {
  it('executes selected controls with interactive permission and ignores the shortcut without it', () => {
    const rights = new Set(['interactive']);
    const execute = jest.fn();
    TestBed.configureTestingModule({
      declarations: [ShortcutHostComponent, PlanEditorKeyHandlerDirective],
      providers: [
        { provide: AuthService, useValue: { hasRight: (right: string) => rights.has(right) } },
        { provide: PlanEditorService, useValue: {} },
        { provide: PlanInteractiveSessionService, useValue: { execute } },
      ],
    });
    const fixture = TestBed.createComponent(ShortcutHostComponent);
    fixture.detectChanges();
    fixture.debugElement
      .query(By.directive(PlanEditorKeyHandlerDirective))
      .injector.get(PlanEditorKeyHandlerDirective)
      .setTreeFocus(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true }));
    expect(execute).toHaveBeenCalledTimes(1);
    rights.clear();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true }));
    expect(execute).toHaveBeenCalledTimes(1);
    fixture.destroy();
  });
});
