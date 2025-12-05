import { Component, input, linkedSignal, OnDestroy, output } from '@angular/core';
import { Subject, throttleTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'step-upload-container',
  templateUrl: './upload-container.component.html',
  styleUrls: ['./upload-container.component.scss'],
  standalone: false,
  host: {
    '[class.drop-area-active]': 'dropAreaActive()',
    '(dragenter)': 'dragEnter()',
    '(dragover)': 'dragOver($event)',
    '(dragleave)': 'dragLeave()',
    '(drop)': 'drop($event)',
  },
})
export class UploadContainerComponent implements OnDestroy {
  readonly isActive = input(true);
  readonly dropAreaActiveInput = input<boolean | undefined>(undefined, { alias: 'dropAreaActive' });
  readonly dropAreaActiveChange = output<boolean>();
  readonly filesChange = output<File[]>();

  protected readonly dropAreaActive = linkedSignal(() => this.dropAreaActiveInput());

  private readonly dropAreaActiveInternal$ = new Subject<boolean>();

  private dropAreaActiveSubscription = this.dropAreaActiveInternal$
    .pipe(throttleTime(300), takeUntilDestroyed())
    .subscribe((dropAreaActive) => {
      this.dropAreaActive.set(dropAreaActive);
      this.dropAreaActiveChange.emit(dropAreaActive);
    });

  ngOnDestroy(): void {
    this.dropAreaActiveInternal$.complete();
  }

  protected dragEnter(): void {
    if (!this.isActive()) {
      return;
    }
    this.dropAreaActiveInternal$.next(true);
  }

  protected dragOver(event: DragEvent): void {
    if (!this.isActive()) {
      return;
    }
    event.preventDefault();
  }

  protected dragLeave(): void {
    if (!this.isActive()) {
      return;
    }
    this.dropAreaActiveInternal$.next(false);
  }

  protected drop(event: DragEvent): void {
    if (!this.isActive()) {
      return;
    }
    event.preventDefault();

    this.dropAreaActiveInternal$.next(false);

    if (!event.dataTransfer) {
      return;
    }

    const dataTransferItems = Array.from(event.dataTransfer.items);

    const files: File[] = [];

    for (const dataTransferItem of dataTransferItems) {
      const file = dataTransferItem.getAsFile();

      if (!file) {
        continue;
      }

      files.push(file);
    }

    if (!files.length) {
      return;
    }

    this.filesChange.emit(files);
  }
}
