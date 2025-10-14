import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { StepMaterialModule } from '../../../step-material/step-material.module';
import { StreamingAttachmentStatusDirective } from '../../directives/streaming-attachment-status.directive';

@Component({
  selector: 'step-streaming-attachment-indicator',
  imports: [StepMaterialModule],
  templateUrl: './streaming-attachment-indicator.component.html',
  styleUrl: './streaming-attachment-indicator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: StreamingAttachmentStatusDirective,
      inputs: ['attachment'],
    },
  ],
})
export class StreamingAttachmentIndicatorComponent {
  private _streamingStatus = inject(StreamingAttachmentStatusDirective, { self: true });

  protected readonly isInProgress = computed(() => this._streamingStatus.status() === 'IN_PROGRESS');
}
