import { computed, Directive, inject, input, OnDestroy } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, map, Observable, switchMap, tap } from 'rxjs';
import { AttachmentUtilsService } from '../injectables/attachment-utils.service';
import { AttachmentMeta, WsChannel, WsFactoryService } from '../../../client/step-client-module';
import { WsResourceStatusChange } from '../types/ws-resource-status-change';
import { AttachmentType } from '../types/attachment-type.enum';

@Directive({
  selector: '[stepStreamingAttachmentStatus]',
})
export class StreamingAttachmentStatusDirective implements OnDestroy {
  private _attachmentUtils = inject(AttachmentUtilsService);
  private _wsFactory = inject(WsFactoryService);

  private wsChannel?: WsChannel<unknown, WsResourceStatusChange>;

  readonly attachment = input<AttachmentMeta | undefined>(undefined);

  private attachmentUrl = computed(() => {
    const attachment = this.attachment();
    const attachmentType = this._attachmentUtils.determineAttachmentType(attachment);
    if (attachmentType !== AttachmentType.STREAMING_TEXT && attachmentType !== AttachmentType.STREAMING_BINARY) {
      return undefined;
    }
    return this._attachmentUtils.getAttachmentStreamingUrl(attachment);
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

  readonly status = toSignal(this.status$);

  ngOnDestroy(): void {
    this.closeChannel();
  }

  private closeChannel(): void {
    this.wsChannel?.disconnect?.();
    this.wsChannel = undefined;
  }
}
