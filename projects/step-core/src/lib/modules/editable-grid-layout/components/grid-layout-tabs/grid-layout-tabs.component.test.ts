import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, Subject } from 'rxjs';
import { AuthService } from '../../../auth';
import { DialogsService, FileDownloaderService } from '../../../basics/step-basics.module';
import { ReportLayoutService } from '../../../../client/generated';
import { GridEditableService } from '../../injectables/grid-editable.service';
import { GridLayoutPermissionUtilsService } from '../../injectables/grid-layout-permission-utils.service';
import { WidgetsPersistenceStateService } from '../../injectables/widgets-persistence-state.service';
import { GridPresetListItem } from '../../types/grid-preset-list-item';
import { WidgetStatePreset } from '../../types/widget-state-preset';
import { GridLayoutTabsComponent } from './grid-layout-tabs.component';

describe('GridLayoutTabsComponent', () => {
  let fixture: ComponentFixture<GridLayoutTabsComponent>;
  let warningResult$: Subject<boolean>;

  const showWarning = jest.fn(() => warningResult$.asObservable());

  const gridEditable = {
    hasChanges: signal(false),
    setEditMode: jest.fn(),
    reset: jest.fn(),
  };

  beforeEach(async () => {
    warningResult$ = new Subject<boolean>();
    showWarning.mockClear();

    const widgetsPersistence = {
      gridPresets: signal<GridPresetListItem[]>([]),
      selectedPreset: signal<WidgetStatePreset | undefined>(undefined),
      selectLocalPreset: jest.fn(),
      selectPreset: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [GridLayoutTabsComponent],
      providers: [
        provideNoopAnimations(),
        { provide: WidgetsPersistenceStateService, useValue: widgetsPersistence },
        { provide: GridEditableService, useValue: gridEditable },
        {
          provide: GridLayoutPermissionUtilsService,
          useValue: {
            isForeignSharedLayout: jest.fn(() => false),
            canEditLayout: jest.fn(() => true),
            canDeleteLayout: jest.fn(() => true),
            canDownloadLayout: jest.fn(() => true),
          },
        },
        { provide: AuthService, useValue: { hasRight: jest.fn(() => true) } },
        { provide: DialogsService, useValue: { showWarning } },
        { provide: ReportLayoutService, useValue: { exportLayout: jest.fn(() => of(undefined)) } },
        { provide: FileDownloaderService, useValue: { downloadJson: jest.fn() } },
      ],
    }).compileComponents();

    gridEditable.hasChanges.set(false);
    gridEditable.setEditMode.mockReset();
    gridEditable.reset.mockReset();

    fixture = TestBed.createComponent(GridLayoutTabsComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('cancels layout editing on Escape', () => {
    const addLayoutButton = fixture.debugElement.query(By.css('.add-layout-button')).nativeElement as HTMLButtonElement;
    addLayoutButton.click();
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.layout-edit-bar'))).not.toBeNull();

    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape' }));
    fixture.detectChanges();

    expect(gridEditable.reset).toHaveBeenCalledTimes(1);
    expect(fixture.debugElement.query(By.css('.layout-edit-bar'))).toBeNull();
  });

  it('ignores Escape while the cancel confirmation is open', () => {
    gridEditable.hasChanges.set(true);
    const addLayoutButton = fixture.debugElement.query(By.css('.add-layout-button')).nativeElement as HTMLButtonElement;
    addLayoutButton.click();
    fixture.detectChanges();

    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape' }));
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape' }));

    expect(showWarning).toHaveBeenCalledTimes(1);

    warningResult$.next(false);
    warningResult$.complete();
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.layout-edit-bar'))).not.toBeNull();

    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape' }));

    expect(showWarning).toHaveBeenCalledTimes(2);
  });
});
