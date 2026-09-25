import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AugmentedTimeSeriesService, AuthService, DashboardsService, DashboardView } from '@exense/step-core';
import { DashboardUrlParamsService } from '../../modules/_common/injectables/dashboard-url-params.service';
import { PipelineAggregationService } from '../../modules/_common/injectables/pipeline-aggregation.service';
import { TimeSeriesContextsFactory } from '../../modules/_common/injectables/time-series-contexts-factory.service';
import { TimeSeriesEntityService } from '../../modules/_common/injectables/time-series-entity.service';
import { DashboardComponent } from './dashboard.component';

jest.mock('../../modules/_common/types/uPlot', () => ({}));

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let openDialogs: unknown[];

  beforeEach(async () => {
    openDialogs = [];
    jest.spyOn(DashboardComponent.prototype, 'ngOnInit').mockImplementation(() => undefined);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: AugmentedTimeSeriesService, useValue: {} },
        { provide: TimeSeriesEntityService, useValue: {} },
        { provide: TimeSeriesContextsFactory, useValue: {} },
        { provide: DashboardsService, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        { provide: Router, useValue: {} },
        { provide: AuthService, useValue: {} },
        { provide: PipelineAggregationService, useValue: {} },
        { provide: MatDialog, useValue: { openDialogs } },
      ],
    })
      .overrideComponent(DashboardComponent, {
        set: {
          template: `
            <button class="enable-edit" (click)="enableEditMode()">Edit</button>
            @if (editMode) {
              <div class="edit-mode">Editing</div>
            }
          `,
          imports: [],
          providers: [{ provide: DashboardUrlParamsService, useValue: {} }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    const dashboard = {
      id: 'dashboard-id',
      attributes: { name: 'Dashboard' },
      timeRange: { type: 'FULL' },
      grouping: [],
      dashlets: [],
      filters: [],
    } as DashboardView;
    Object.assign(fixture.componentInstance, { dashboard });
    fixture.detectChanges();
  });

  afterEach(() => jest.restoreAllMocks());

  it('cancels dashboard editing on Escape', () => {
    const enableEditButton = fixture.debugElement.query(By.css('.enable-edit')).nativeElement as HTMLButtonElement;
    enableEditButton.click();
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.edit-mode'))).not.toBeNull();

    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape' }));
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.edit-mode'))).toBeNull();
  });

  it('ignores Escape while a modal is open', () => {
    const enableEditButton = fixture.debugElement.query(By.css('.enable-edit')).nativeElement as HTMLButtonElement;
    enableEditButton.click();
    fixture.detectChanges();
    openDialogs.push({});

    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape' }));
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.edit-mode'))).not.toBeNull();
  });
});
