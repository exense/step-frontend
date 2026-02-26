import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  AttachmentMeta,
  AugmentedResourcesService,
  StreamingAttachmentIndicatorComponent,
  StreamingAttachmentMeta,
} from '@exense/step-core';
import { v4 } from 'uuid';
import { By } from '@angular/platform-browser';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AugmentedStreamingResourcesService } from '../../../../client/augmented/services/augmented-streaming-resources.service';

const SIMPLE_ATTACHMENT: AttachmentMeta = {
  name: 'test.jpg',
  mimeType: 'image/jpeg',
  type: 'step.attachment.AttachmentMeta',
  id: v4(),
};

const STREAMING_ATTACHMENT: StreamingAttachmentMeta = {
  name: 'test.txt',
  mimeType: 'plain/text',
  type: 'step.attachments.StreamingAttachmentMeta',
  id: v4(),
  currentNumberOfLines: 10,
  status: 'INITIATED',
};

const IN_PROGRESS_STREAMING_ATTACHMENT: StreamingAttachmentMeta = {
  ...STREAMING_ATTACHMENT,
  status: 'IN_PROGRESS',
};

describe('StreamingAttachmentIndicatorComponent', () => {
  let fixture: ComponentFixture<StreamingAttachmentIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamingAttachmentIndicatorComponent],
      providers: [
        {
          provide: AugmentedResourcesService,
          useValue: null,
        },
        {
          provide: AugmentedStreamingResourcesService,
          useValue: null,
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(StreamingAttachmentIndicatorComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('Check indicator visibility', async () => {
    let indicator = fixture.debugElement.query(By.directive(MatProgressSpinner));
    expect(indicator).toBeNull();

    fixture.componentRef.setInput('attachment', SIMPLE_ATTACHMENT);
    fixture.detectChanges();
    await fixture.whenStable();
    indicator = fixture.debugElement.query(By.directive(MatProgressSpinner));
    expect(indicator).toBeNull();

    fixture.componentRef.setInput('attachment', STREAMING_ATTACHMENT);
    fixture.detectChanges();
    await fixture.whenStable();
    indicator = fixture.debugElement.query(By.directive(MatProgressSpinner));
    expect(indicator).toBeNull();

    fixture.componentRef.setInput('attachment', IN_PROGRESS_STREAMING_ATTACHMENT);
    fixture.detectChanges();
    await fixture.whenStable();
    indicator = fixture.debugElement.query(By.directive(MatProgressSpinner));
    expect(indicator).not.toBeNull();
  });
});
