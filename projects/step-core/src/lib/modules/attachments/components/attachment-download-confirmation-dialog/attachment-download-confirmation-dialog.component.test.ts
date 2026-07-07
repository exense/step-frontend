import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { AttachmentDownloadConfirmationDialogComponent } from './attachment-download-confirmation-dialog.component';

describe('AttachmentDownloadConfirmationDialogComponent', () => {
  let fixture: ComponentFixture<AttachmentDownloadConfirmationDialogComponent>;
  let dialogRef: { close: jest.Mock };

  beforeEach(async () => {
    dialogRef = {
      close: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AttachmentDownloadConfirmationDialogComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: dialogRef,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            fileName: 'binary.bin',
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AttachmentDownloadConfirmationDialogComponent);
    fixture.detectChanges();
  });

  it('does not confirm the download when Enter bubbles from an action button', () => {
    const cancelButton = fixture.debugElement.query(By.css('button[mat-dialog-close]')).nativeElement as HTMLElement;

    cancelButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('confirms the download from the primary action button', () => {
    const downloadButton = fixture.debugElement.query(By.css('button[color="primary"]')).nativeElement as HTMLElement;

    downloadButton.click();

    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });
});
