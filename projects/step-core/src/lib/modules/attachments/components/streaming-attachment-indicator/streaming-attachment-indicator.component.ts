import { ChangeDetectionStrategy, Component, computed, inject, input, OnDestroy } from '@angular/core';
import { AttachmentUtilsService } from '../../injectables/attachment-utils.service';
import { AttachmentMeta, WsChannel, WsFactoryService } from '../../../../client/step-client-module';
import { WsResourceStatusChange } from '../../types/ws-resource-status-change';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, map, Observable, switchMap, tap } from 'rxjs';
import { StepMaterialModule } from '../../../step-material/step-material.module';

@Component({
  selector: 'step-streaming-attachment-indicator',
  imports: [StepMaterialModule],
  templateUrl: './streaming-attachment-indicator.component.html',
  styleUrl: './streaming-attachment-indicator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StreamingAttachmentIndicatorComponent implements OnDestroy {
  private _attachmentUtils = inject(AttachmentUtilsService);
  private _wsFactory = inject(WsFactoryService);

  private wsChannel?: WsChannel<unknown, WsResourceStatusChange>;

  readonly attachmentOrId = input<AttachmentMeta | string | undefined>(undefined);

  private attachmentUrl = computed(() => {
    const attachmentOrId = this.attachmentOrId();
    return this._attachmentUtils.getAttachmentStreamingUrl(attachmentOrId);
  });

  private status$ = toObservable(this.attachmentUrl).pipe(
    tap(() => this.closeChannel()),
    filter((url) => !!url),
    map((url) => {
      this.wsChannel = this._wsFactory.connect(url!);
      return this.wsChannel;
    }),
    switchMap(
      (channel) =>
        channel.data$.pipe(
          filter((response) => {
            if (response instanceof Blob) {
              return false;
            }
            return response['@'] === 'StatusChanged';
          }),
        ) as Observable<WsResourceStatusChange>,
    ),
    map((response) => response?.resourceStatus?.transferStatus),
  );

  private status = toSignal(this.status$);

  protected readonly isInProgress = computed(() => this.status() === 'IN_PROGRESS');

  ngOnDestroy(): void {
    this.closeChannel();
  }

  private closeChannel(): void {
    this.wsChannel?.disconnect?.();
    this.wsChannel = undefined;
  }
}
