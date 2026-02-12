import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddFieldButtonComponent } from './add-field-button.component';
import { By } from '@angular/platform-browser';

const eventLike = {
  stopPropagation() {},
};

const FIELDS = ['field_A', 'field_B', 'field_C'];

describe('AddFieldButtonComponent', () => {
  let fixture: ComponentFixture<AddFieldButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddFieldButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddFieldButtonComponent) as ComponentFixture<AddFieldButtonComponent<string>>;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  const getButtons = () => {
    const addField = fixture.debugElement.query(By.css('button.add-additional'));
    const possibleFields = fixture.debugElement.queryAll(By.css('.possible-fields-container > button'));
    return { addField, possibleFields };
  };

  it('No possible fields', async () => {
    const emitAddFiled = jest.spyOn(fixture.componentInstance.addField, 'emit');
    let btn = getButtons();
    expect(btn.addField).toBeTruthy();
    expect(btn.possibleFields.length).toBe(0);

    btn.addField.triggerEventHandler('click', eventLike);
    fixture.detectChanges();
    await fixture.whenStable();

    btn = getButtons();
    expect(btn.addField).toBeTruthy();
    expect(btn.possibleFields.length).toBe(0);

    expect(emitAddFiled).toHaveBeenCalledWith(undefined);
  });

  it('With possible fields', async () => {
    fixture.componentRef.setInput('possibleFields', FIELDS);
    fixture.detectChanges();
    await fixture.whenStable();

    const emitAddFiled = jest.spyOn(fixture.componentInstance.addField, 'emit');
    let btn = getButtons();
    expect(btn.addField).toBeTruthy();
    expect(btn.possibleFields.length).toBe(0);

    btn.addField.triggerEventHandler('click', eventLike);
    fixture.detectChanges();
    await fixture.whenStable();

    btn = getButtons();
    expect(btn.addField).toBeFalsy();
    expect(btn.possibleFields.length).toBe(FIELDS.length + 1);
    expect(emitAddFiled).not.toHaveBeenCalled();

    for (let i = 0; i < FIELDS.length; i++) {
      btn.possibleFields[i].triggerEventHandler('click', eventLike);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(emitAddFiled).toHaveBeenCalledWith(FIELDS[i]);
      emitAddFiled.mockReset();

      btn = getButtons();
      expect(btn.addField).toBeTruthy();
      expect(btn.possibleFields.length).toBe(0);

      btn.addField.triggerEventHandler('click', eventLike);
      fixture.detectChanges();
      await fixture.whenStable();
      btn = getButtons();
      expect(btn.addField).toBeFalsy();
      expect(btn.possibleFields.length).toBe(FIELDS.length + 1);
    }
    btn.possibleFields[btn.possibleFields.length - 1].triggerEventHandler('click', eventLike);
    expect(emitAddFiled).toHaveBeenCalledWith(undefined);
  });

  it('Child mode', async () => {
    let first = fixture.debugElement.children[0];
    let last = fixture.debugElement.children[fixture.debugElement.children.length - 1];
    expect(first.name).toBe('hr');
    expect(last.name).toBe('hr');

    fixture.componentRef.setInput('isChildMode', true);
    fixture.detectChanges();
    await fixture.whenStable();

    first = fixture.debugElement.children[0];
    last = fixture.debugElement.children[fixture.debugElement.children.length - 1];
    expect(first.name).not.toBe('hr');
    expect(last.name).not.toBe('hr');
  });
});
