import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  NgZone,
  output,
} from '@angular/core';
import { AggregatedReportView, StepBasicsModule, StepIconsModule } from '@exense/step-core';
import { AggregatedReportViewCountErrorsPipe } from '../../pipes/aggregated-report-view-count-errors.pipe';

@Component({
  selector: 'step-test-case-inline-root-cause',
  imports: [StepIconsModule, StepBasicsModule],
  templateUrl: './test-case-inline-root-cause.component.html',
  styleUrl: './test-case-inline-root-cause.component.scss',
  providers: [AggregatedReportViewCountErrorsPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestCaseInlineRootCauseComponent implements AfterViewInit {
  readonly item = input.required<AggregatedReportView>();
  readonly searchFor = output<string>();

  private _aggregatedReportViewPipe = inject(AggregatedReportViewCountErrorsPipe);
  private _element: ElementRef<HTMLElement> = inject(ElementRef<HTMLElement>);
  private _zone: NgZone = inject(NgZone);
  private _changeDetection = inject(ChangeDetectorRef);
  private resizeObserver?: ResizeObserver;
  protected currentWidth?: number;

  ngAfterViewInit(): void {
    const container = this.findContainer();
    if (!container) return;

    const update = (): void => {
      const targetWidth = Math.max(0, container.clientWidth - 40);

      if (this.currentWidth || 0 < container.clientWidth - 60 || this.currentWidth || 0 > container.clientWidth + 60) {
        this._zone.run(() => {
          this.currentWidth = targetWidth;
          this._changeDetection.markForCheck();
        });
      }
    };

    // Observe the container size; also run once initially
    this._zone.runOutsideAngular(() => {
      this.resizeObserver = new ResizeObserver(update);
      this.resizeObserver.observe(container);
    });
    update();
  }

  onErrorClick(event: MouseEvent, message: string): void {
    event.stopPropagation();
    this.searchFor.emit(message);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  private findContainer(): HTMLElement | null {
    return this._element.nativeElement.closest('td');
  }

  protected readonly errorCounts = computed(() => {
    const item = this.item();
    return this._aggregatedReportViewPipe.transform(item);
  });

  protected readonly singleMessage = computed(() => {
    const item = this.item();
    return Object.keys(item.countByErrorMessage ?? [])[0] ?? Object.keys(item.countByChildrenErrorMessage ?? [])[0];
  });
}
