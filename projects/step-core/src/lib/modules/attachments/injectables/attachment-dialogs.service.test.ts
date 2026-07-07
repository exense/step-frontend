import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { AttachmentMeta } from '../../../client/step-client-module';
import { AttachmentDialogComponent } from '../components/attachment-dialog/attachment-dialog.component';
import { AttachmentDownloadConfirmationDialogComponent } from '../components/attachment-download-confirmation-dialog/attachment-download-confirmation-dialog.component';
import { AttachmentType } from '../types/attachment-type.enum';
import { AttachmentDialogsService } from './attachment-dialogs.service';
import { AttachmentUtilsService } from './attachment-utils.service';

describe('AttachmentDialogsService', () => {
  let service: AttachmentDialogsService;
  let matDialog: { open: jest.Mock };
  let attachmentUtils: { determineAttachmentType: jest.Mock; downloadAttachment: jest.Mock };

  beforeEach(() => {
    matDialog = {
      open: jest.fn(() => ({
        afterClosed: () => of(true),
      })),
    };
    attachmentUtils = {
      determineAttachmentType: jest.fn(),
      downloadAttachment: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AttachmentDialogsService,
        {
          provide: MatDialog,
          useValue: matDialog,
        },
        {
          provide: AttachmentUtilsService,
          useValue: attachmentUtils,
        },
      ],
    });

    service = TestBed.inject(AttachmentDialogsService);
  });

  it('asks before downloading default non-previewable attachments', () => {
    const attachment = createAttachment({
      name: 'binary.bin',
      mimeType: 'application/octet-stream',
    });
    attachmentUtils.determineAttachmentType.mockReturnValue(AttachmentType.DEFAULT);

    service.showDetails(attachment);

    expect(matDialog.open).toHaveBeenCalledWith(AttachmentDownloadConfirmationDialogComponent, {
      data: {
        fileName: 'binary.bin',
      },
    });
    expect(attachmentUtils.downloadAttachment).toHaveBeenCalledWith(attachment);
  });

  it('does not download default attachments when the confirmation is cancelled', () => {
    matDialog.open.mockReturnValue({
      afterClosed: () => of(undefined),
    });
    attachmentUtils.determineAttachmentType.mockReturnValue(AttachmentType.DEFAULT);

    service.showDetails(createAttachment({ name: 'binary.bin', mimeType: 'application/octet-stream' }));

    expect(attachmentUtils.downloadAttachment).not.toHaveBeenCalled();
  });

  it('asks before downloading streaming binary attachments', () => {
    const attachment = createAttachment({ name: 'stream.bin' });
    attachmentUtils.determineAttachmentType.mockReturnValue(AttachmentType.STREAMING_BINARY);

    service.showDetails(attachment);

    expect(matDialog.open).toHaveBeenCalledWith(AttachmentDownloadConfirmationDialogComponent, {
      data: {
        fileName: 'stream.bin',
      },
    });
  });

  it('keeps opening the viewer for PDF default attachments', () => {
    const attachment = createAttachment({ name: 'report.pdf', mimeType: 'application/pdf' });
    attachmentUtils.determineAttachmentType.mockReturnValue(AttachmentType.DEFAULT);

    service.showDetails(attachment);

    expect(matDialog.open).toHaveBeenCalledWith(AttachmentDialogComponent, {
      data: attachment,
      width: '88vw',
      maxWidth: '88vw',
      height: 'auto',
      maxHeight: 'auto',
      panelClass: undefined,
    });
  });

  it('does not treat a file named pdf without an extension as a PDF attachment', () => {
    const attachment = createAttachment({ name: 'pdf' });
    attachmentUtils.determineAttachmentType.mockReturnValue(AttachmentType.DEFAULT);

    service.showDetails(attachment);

    expect(matDialog.open).toHaveBeenCalledWith(AttachmentDownloadConfirmationDialogComponent, {
      data: {
        fileName: 'pdf',
      },
    });
  });

  it('keeps opening the viewer for text attachments', () => {
    const attachment = createAttachment({ name: 'log.txt', mimeType: 'text/plain' });
    attachmentUtils.determineAttachmentType.mockReturnValue(AttachmentType.TEXT);

    service.showDetails(attachment);

    expect(matDialog.open).toHaveBeenCalledWith(AttachmentDialogComponent, {
      data: attachment,
      width: '88vw',
      maxWidth: '88vw',
      height: 'auto',
      maxHeight: 'auto',
      panelClass: undefined,
    });
  });
});

const createAttachment = (options: { name: string; mimeType?: string }): AttachmentMeta => ({
  id: 'attachment-id',
  name: options.name,
  mimeType: options.mimeType,
  type: 'step.attachment.AttachmentMeta',
});
