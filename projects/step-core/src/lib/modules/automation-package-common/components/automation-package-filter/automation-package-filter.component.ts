import { Component, ElementRef, forwardRef, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import {
  map,
  Observable,
  of,
  switchMap,
  combineLatest,
  distinctUntilChanged,
  Subject,
  takeUntil,
  BehaviorSubject,
  merge,
} from 'rxjs';
import {
  arrayToRegex,
  BaseFilterComponent,
  PopoverOverlayService,
  regexToArray,
} from '../../../basics/step-basics.module';
import { AutomationPackageFilterPopoverComponent } from '../automation-package-filter-popover/automation-package-filter-popover.component';
import { EntityAutomationPackageService } from '../../injectables/entity-automation-package.service';

type PopoverOverlay = PopoverOverlayService<AutomationPackageFilterPopoverComponent>;

const DEFAULT_TOOLTIP = 'Filter by package name';

@Component({
  selector: 'step-automation-package-filter',
  templateUrl: './automation-package-filter.component.html',
  styleUrls: ['./automation-package-filter.component.scss'],
  providers: [
    {
      provide: BaseFilterComponent,
      useExisting: forwardRef(() => AutomationPackageFilterComponent),
    },
    PopoverOverlayService,
  ],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class AutomationPackageFilterComponent
  extends BaseFilterComponent<string, string[]>
  implements OnInit, OnDestroy
{
  private popoverStreamsTerminator$?: Subject<void>;
  private refreshTooltip$ = new BehaviorSubject<unknown>(undefined);

  private _elRef = inject(ElementRef);
  private _popoverOverlay = inject<PopoverOverlay>(PopoverOverlayService);
  private _entityAutomationPackageService = inject(EntityAutomationPackageService);

  protected selectedIds: string[] = [];
  protected tooltipText$: Observable<string> = of(DEFAULT_TOOLTIP);

  override ngOnInit(): void {
    super.ngOnInit();
    this.setupTooltip();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.terminatePopoverStreams();
    this.refreshTooltip$.complete();
  }

  override assignValue(value?: string): void {
    super.assignValue(value);
    this.selectedIds = this.filterControl.value;
    this.refreshTooltip$.next(undefined);
    this._cd.detectChanges();
  }

  showPopover(): void {
    this.terminatePopoverStreams();

    const component = this._popoverOverlay.open(AutomationPackageFilterPopoverComponent, this._elRef).getComponent();

    if (!component) {
      return;
    }

    this.popoverStreamsTerminator$ = new Subject<void>();

    component.select(this.filterControl.value as string[]);
    component.selected$.pipe(takeUntil(this.popoverStreamsTerminator$)).subscribe((selectedIds) => {
      this.selectedIds = selectedIds as string[];
      this._cd.detectChanges();
    });
    component.cleared.subscribe(() => this._popoverOverlay.close());

    this._popoverOverlay
      .getCloseStream$()
      ?.pipe(takeUntil(this.popoverStreamsTerminator$))
      .subscribe(() => {
        this.filterControl.setValue(this.selectedIds);
        this.terminatePopoverStreams();
      });
  }

  protected createControl(fb: FormBuilder): FormControl<string[]> {
    return fb.nonNullable.control<string[]>([]);
  }

  protected override createControlChangeStream(control: FormControl<string[]>): Observable<string> {
    return control.valueChanges.pipe(map((value) => arrayToRegex(value)));
  }

  protected override transformFilterValueToControlValue(value?: string): string[] {
    return !value ? [] : regexToArray(value);
  }

  private setupTooltip(): void {
    const currentSelection$ = merge(
      this.refreshTooltip$.pipe(map(() => this.filterControl.value)),
      this.filterControl.valueChanges,
    );

    this.tooltipText$ = currentSelection$.pipe(
      switchMap((ids) => {
        if (!ids.length) {
          return of([]);
        }
        const packageNames$ = ids.map((id) => {
          return this._entityAutomationPackageService.getEntityPackageById(id).pipe(
            map((automationPackage) => automationPackage?.attributes?.['name']),
            distinctUntilChanged(),
          );
        });
        return combineLatest(packageNames$);
      }),
      map((packageNames) => packageNames.filter((name) => !!name).join(', ')),
      map((tooltip) => (tooltip ? 'Currently filtering: ' + tooltip : DEFAULT_TOOLTIP)),
    );
  }

  private terminatePopoverStreams(): void {
    this.popoverStreamsTerminator$?.next();
    this.popoverStreamsTerminator$?.complete();
    this.popoverStreamsTerminator$ = undefined;
  }
}
