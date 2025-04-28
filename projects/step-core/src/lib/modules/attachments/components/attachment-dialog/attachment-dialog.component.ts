import { ChangeDetectionStrategy, Component, inject, OnInit, viewChild, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AttachmentUtilsService } from '../../injectables/attachment-utils.service';
import { AttachmentType } from '../../types/attachment-type.enum';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { AttachmentUrlPipe } from '../../pipes/attachment-url.pipe';
import { AttachmentMeta, AugmentedResourcesService } from '../../../../client/step-client-module';
import { NgOptimizedImage } from '@angular/common';
import { RichEditorComponent } from '../../../rich-editor';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'step-attachment-dialog',
  standalone: true,
  imports: [StepBasicsModule, AttachmentUrlPipe, NgOptimizedImage, RichEditorComponent],
  templateUrl: './attachment-dialog.component.html',
  styleUrl: './attachment-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.small]': 'attachmentType === AttachmentType.DEFAULT',
  },
})
export class AttachmentDialogComponent implements OnInit {
  private _resourceService = inject(AugmentedResourcesService);
  private _attachmentUtils = inject(AttachmentUtilsService);
  private _fb = inject(FormBuilder).nonNullable;
  protected readonly _data = inject<AttachmentMeta>(MAT_DIALOG_DATA);

  private richEditor = viewChild('richEditor', { read: RichEditorComponent });
  protected readonly contentCtrl = this._fb.control('');
  protected readonly attachmentType = this._attachmentUtils.determineAttachmentType(this._data);
  protected readonly AttachmentType = AttachmentType;

  ngOnInit(): void {
    this.initializeContent();
  }

  protected download(): void {
    this._attachmentUtils.downloadAttachment(this._data);
  }

  private initializeContent(): void {
    this.contentCtrl.disable();
    if (this.attachmentType !== AttachmentType.TEXT) {
      return;
    }
    this._resourceService.getResourceContentAsText(this._data.id!).subscribe((content) => {
      this.contentCtrl.setValue(content);
      this.richEditor()?.clearSelection?.();
    });
  }
}
