import { Component, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'step-upload-container',
  templateUrl: './upload-container.component.html',
  styleUrls: ['./upload-container.component.scss'],
  standalone: false,
})
export class UploadContainerComponent {
  @HostBinding('class.drop-area-active') @Input() dropAreaActive?: boolean;

  @Output() dropAreaActiveChange = new EventEmitter<boolean>();
  @Output() filesChange = new EventEmitter<File[]>();

  @HostListener('dragenter')
  onDragEnter(): void {
    this.setDropAreaActive(true);
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  @HostListener('dragleave')
  onDragLeave(): void {
    this.setDropAreaActive(false);
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent): void {
    event.preventDefault();

    this.setDropAreaActive(false);

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

  private setDropAreaActive(dropAreaActive: boolean): void {
    this.dropAreaActive = dropAreaActive;
    this.dropAreaActiveChange.emit(dropAreaActive);
  }
}
