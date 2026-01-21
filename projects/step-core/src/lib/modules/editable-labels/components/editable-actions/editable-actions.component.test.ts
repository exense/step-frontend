import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditableActionsComponent } from './editable-actions.component';
import { By } from '@angular/platform-browser';

describe('EditableActionsComponent', () => {
  let fixture: ComponentFixture<EditableActionsComponent>;
  let spyEmitApply: jest.SpyInstance;
  let spyEmitCancel: jest.SpyInstance;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditableActionsComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(EditableActionsComponent);

    spyEmitApply = jest.spyOn(fixture.componentInstance.apply, 'emit');
    spyEmitCancel = jest.spyOn(fixture.componentInstance.cancel, 'emit');

    spyEmitApply.mockReset();
    spyEmitCancel.mockReset();

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('Emit events', () => {
    const [applyButton, cancelButton] = fixture.debugElement.queryAll(By.css('button'));

    expect(spyEmitApply).not.toHaveBeenCalled();
    applyButton.triggerEventHandler('click', null);
    expect(spyEmitApply).toHaveBeenCalled();

    expect(spyEmitCancel).not.toHaveBeenCalled();
    cancelButton.triggerEventHandler('click', null);
    expect(spyEmitCancel).toHaveBeenCalled();
  });
});
