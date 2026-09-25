import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { provideTestStepApi } from '../../client/step-client-module';
import { FilePickerModalData, FilePickerModalResult, SelectionMode } from '../file-picker';
import { ResourceInputComponent } from './components/resource-input/resource-input.component';
import { RESOURCE_AP_ID } from './injectables/resource-ap-id.token';

const AP_ID = 'ap-42';
const DIRECTORY_PATH = 'cypress/project';

@Component({
  imports: [FormsModule, ResourceInputComponent],
  template: `
    <step-resource-input
      resourceType="functions"
      [allowDirectorySelection]="allowDirectorySelection()"
      [ngModel]="value()"
      (ngModelChange)="value.set($event)"
    />
  `,
})
class HostComponent {
  /* eslint-disable step-lint/component-public-fields -- the test drives and reads this host state from outside the component. */
  readonly allowDirectorySelection = signal(false);
  readonly value = signal<string | undefined>(undefined);
  /* eslint-enable step-lint/component-public-fields */
}

describe('Automation package resource picker', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let openDialog: jest.SpyInstance;
  let dialogResult: FilePickerModalResult | undefined;

  const openPicker = (): void => {
    const pickerButton = fixture.debugElement.query(By.css('step-automation-package-resource button'));
    pickerButton.nativeElement.click();
    fixture.detectChanges();
  };

  const lastPickerData = (): FilePickerModalData => {
    const lastCall = openDialog.mock.calls[openDialog.mock.calls.length - 1];
    return lastCall[1].data;
  };

  beforeEach(async () => {
    dialogResult = undefined;
    // MatDialogModule providers come with StepBasicsModule, so the component injector shadows a
    // TestBed level MatDialog override. Patching the prototype intercepts every instance.
    openDialog = jest
      .spyOn(MatDialog.prototype, 'open')
      .mockImplementation(() => ({ afterClosed: () => of(dialogResult) }) as never);

    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideTestStepApi(), { provide: RESOURCE_AP_ID, useValue: signal(AP_ID) }],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    openDialog.mockRestore();
  });

  it('Restricts the picker to files by default', () => {
    openPicker();
    expect(lastPickerData().selectionMode).toBe(SelectionMode.FILE);
  });

  it('Allows picking a directory when directory selection is enabled', () => {
    host.allowDirectorySelection.set(true);
    fixture.detectChanges();

    dialogResult = { filePath: DIRECTORY_PATH };
    openPicker();

    expect(lastPickerData().selectionMode).toBe(SelectionMode.BOTH);
    expect(host.value()).toBe(`apResource:${AP_ID}:${DIRECTORY_PATH}`);
  });
});
