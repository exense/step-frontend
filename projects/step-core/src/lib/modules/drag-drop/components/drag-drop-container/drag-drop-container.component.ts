import {
  Component,
  DestroyRef,
  ElementRef,
  EnvironmentInjector,
  forwardRef,
  inject,
  InjectionToken,
  Injector,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { DragDataService } from '../../injectables/drag-data.service';
import { DragDropGroupService } from '../../injectables/drag-drop-group.service';
import { DragDropContainerService } from '../../injectables/drag-drop-container.service';
import { DragDropGroupContainerService } from '../../injectables/drag-drop-group-container.service';
import { DRAG_DROP_GROUP_CONTAINERS } from '../../injectables/drag-drop-group-containers.token';
import { DROP_AREA_ID } from '../../injectables/drop-area-id.token';

const DRAG_DROP_CONTAINER_INTERNAL = new InjectionToken<DragDataService & DragDropGroupService>(
  'Internal token for drag drop group container',
);

const dragDropGroupContainerFactory = () => {
  const _injector = inject(Injector);
  const _destroyRef = inject(DestroyRef);
  const _elRef = inject(ElementRef);

  const _dropAreaId = inject(DROP_AREA_ID, { optional: true });
  const _parents = inject(DRAG_DROP_GROUP_CONTAINERS, { skipSelf: true, optional: true });

  const parent = _dropAreaId ? _parents?.find((item) => item.dropAreaId === _dropAreaId) : undefined;

  // If parent group has been found, return parent group
  if (parent) {
    return parent;
  }

  // Otherwise create instance of DragDropGroupContainerService
  const internalInjector = Injector.create({
    providers: [{ provide: ElementRef, useValue: _elRef }, DragDropGroupContainerService],
    parent: _injector,
  }) as EnvironmentInjector;
  _destroyRef.onDestroy(() => internalInjector.destroy());

  return internalInjector.get(DragDropGroupContainerService);
};

@Component({
  selector: 'step-drag-drop-container',
  standalone: true,
  imports: [],
  templateUrl: './drag-drop-container.component.html',
  styleUrl: './drag-drop-container.component.scss',
  providers: [
    {
      provide: DRAG_DROP_CONTAINER_INTERNAL,
      useFactory: dragDropGroupContainerFactory,
    },
    {
      provide: DragDataService,
      useExisting: DRAG_DROP_CONTAINER_INTERNAL,
    },
    {
      provide: DragDropGroupService,
      useExisting: DRAG_DROP_CONTAINER_INTERNAL,
    },
    {
      provide: DragDropContainerService,
      useExisting: forwardRef(() => DragDropContainerComponent),
    },
  ],
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.drag-in-progress]': 'isDragStarted()',
  },
})
export class DragDropContainerComponent implements OnInit, OnDestroy, DragDropContainerService {
  private _dragDropGroup = inject(DragDropGroupService);

  protected isDragStarted = signal(false);

  /** @ViewChild('dragImageContainer', { static: true }) **/
  private dragImageContainer = viewChild<ElementRef<HTMLDivElement>>('dragImageContainer');

  /** @ViewChild('dragPreview', { static: true }) **/
  private dragPreview = viewChild<ElementRef<HTMLDivElement>>('dragPreview');

  ngOnInit(): void {
    this._dragDropGroup.registerGroupItem(this);
  }

  ngOnDestroy(): void {
    this._dragDropGroup.unregisterGroupItem(this);
  }

  getImageContainer(): HTMLElement | undefined {
    return this.dragImageContainer()?.nativeElement;
  }

  getPreviewNode(): HTMLElement | undefined {
    return this.dragPreview()?.nativeElement;
  }

  setIsDragStarted(value: boolean): void {
    this.isDragStarted.set(value);
  }
}
