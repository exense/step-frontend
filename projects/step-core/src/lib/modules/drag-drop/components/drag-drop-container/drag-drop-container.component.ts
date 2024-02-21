import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { BehaviorSubject, Subject, switchMap, timer } from 'rxjs';
import { v4 } from 'uuid';
import { DragDataService } from '../../injectables/drag-data.service';
import { DRAG_DROP_CLASS_NAMES } from '../../injectables/drag-drop-class-names.token';

@Component({
  selector: 'step-drag-drop-container',
  standalone: true,
  imports: [],
  templateUrl: './drag-drop-container.component.html',
  styleUrl: './drag-drop-container.component.scss',
  providers: [
    {
      provide: DragDataService,
      useExisting: DragDropContainerComponent,
    },
  ],
  encapsulation: ViewEncapsulation.None,
})
export class DragDropContainerComponent implements AfterViewInit, OnDestroy, DragDataService {
  private _elRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private _classNames = inject(DRAG_DROP_CLASS_NAMES);
  private _zone = inject(NgZone);

  private dragStartInternal$ = new Subject<void>();
  private dragEndInternal$ = new Subject<void>();

  readonly dragAreaId = v4();
  readonly dragStart$ = this.dragStartInternal$.asObservable();
  readonly dragEnd$ = this.dragEndInternal$.asObservable();

  private isDragStartedInternal = false;

  get isDragStarted(): boolean {
    return this.isDragStartedInternal;
  }

  private dragDataInternal$ = new BehaviorSubject<unknown | undefined>(undefined);

  readonly dragData$ = this.dragDataInternal$.asObservable();

  get dragData(): unknown | undefined {
    return this.dragDataInternal$.value;
  }

  @ViewChild('dragImageContainer', { static: true }) private dragImageContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('dragPreview', { static: true }) private dragPreview!: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    this.dragEnd$.pipe(switchMap(() => timer(50))).subscribe(() => this.cleanup());
  }

  ngOnDestroy(): void {
    this.dragStartInternal$.complete();
    this.dragEndInternal$.complete();
    this.cleanup();
  }

  createDragImageForElement(element: HTMLElement): HTMLElement {
    let previewNode = this.getPreviewNode();
    if (previewNode) {
      return previewNode;
    }
    previewNode = element.cloneNode(true) as HTMLElement;
    previewNode.draggable = false;
    previewNode.classList.remove(this._classNames.DRAG_IN_PROGRESS);
    this.dragImageContainer.nativeElement.appendChild(previewNode);
    return previewNode;
  }

  dragStart(dragData?: unknown): void {
    this.dragDataInternal$.next(dragData);
    this.isDragStartedInternal = true;
    this.dragStartInternal$.next();
  }

  dragEnd(): void {
    this.dragDataInternal$.next(undefined);
    this.isDragStartedInternal = false;
    this.dragEndInternal$.next();
  }

  private cleanup(): void {
    this._zone.runOutsideAngular(() => {
      this._elRef.nativeElement.querySelectorAll(`.${this._classNames.DRAG_OVER}`).forEach((element) => {
        element.classList.remove(this._classNames.DRAG_OVER);
      });
      this._elRef.nativeElement.querySelectorAll(`.${this._classNames.DRAG_IN_PROGRESS}`).forEach((element) => {
        element.classList.remove(this._classNames.DRAG_IN_PROGRESS);
      });
      this.dragImageContainer.nativeElement.childNodes.forEach((child) => child.remove());
    });
  }

  private getPreviewNode(): HTMLElement | undefined {
    const dragPreview = this.dragPreview.nativeElement.querySelector<HTMLElement>('step-drag-preview');
    if (!dragPreview || !dragPreview.children.length) {
      return undefined;
    }
    return dragPreview;
  }
}
