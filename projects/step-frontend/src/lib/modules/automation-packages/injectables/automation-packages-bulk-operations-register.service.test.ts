import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  AsyncOperationCloseStatus,
  AuthService,
  BulkOperationConfig,
  BulkOperationPerformStrategy,
  BulkOperationsComponent,
  BulkSelectionType,
  EntitySelectionState,
  provideTestStepApi,
  SelectionList,
  TableReload,
} from '@exense/step-core';
import { BehaviorSubject, map } from 'rxjs';
import { AP_ENTITY_ID, AP_RESOURCE_LIBRARY_ENTITY_ID } from '../types/constants';
import { AutomationPackagesBulkOperationsRegisterService } from './automation-packages-bulk-operations-register.service';
import { TableFilter } from '../../../../../../step-core/src/lib/modules/table/services/table-filter';

describe('Automation package bulk permissions', () => {
  let fixture: ComponentFixture<BulkOperationsComponent<string, unknown>>;
  let http: HttpTestingController;
  const rights = new BehaviorSubject(new Set<string>());

  beforeEach(() => {
    rights.next(new Set(['automation-package-read', 'resource-read', 'resource-bulk-delete']));
    TestBed.configureTestingModule({
      imports: [BulkOperationsComponent],
      providers: [
        provideTestStepApi(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        {
          provide: AuthService,
          useValue: { hasRight$: (right: string) => rights.pipe(map((current) => current.has(right))) },
        },
        { provide: TableFilter, useValue: {} },
        { provide: TableReload, useValue: { reload: jest.fn() } },
        { provide: SelectionList, useValue: { clearSelection: jest.fn() } },
        {
          provide: EntitySelectionState,
          useValue: {
            selectedKeys: signal(new Set(['selected'])),
            selectedSize: signal(1),
            selectionType: signal(BulkSelectionType.INDIVIDUAL),
          },
        },
        {
          provide: BulkOperationPerformStrategy,
          useValue: {
            invoke: (config: BulkOperationConfig<string>) =>
              config
                .operationInfo!.operation({
                  ids: config.ids ? [...config.ids] : undefined,
                  targetType: 'LIST',
                  preview: false,
                })
                .pipe(map(() => ({ closeStatus: AsyncOperationCloseStatus.SUCCESS }))),
          },
        },
      ],
    });
    TestBed.inject(AutomationPackagesBulkOperationsRegisterService).register();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    fixture?.destroy();
    http.verify();
  });

  function render(entity: string, operation: string): HTMLButtonElement {
    fixture = TestBed.createComponent(BulkOperationsComponent<string, unknown>);
    fixture.componentRef.setInput('entity', entity);
    fixture.detectChanges();
    return fixture.nativeElement.querySelector(`button.${operation}`);
  }

  it('requires package-write for bulk refresh and calls the package refresh service', fakeAsync(() => {
    const refresh = render(AP_ENTITY_ID, 'refresh');
    expect(refresh.disabled).toBe(true);
    rights.next(new Set(['automation-package-read', 'automation-package-write']));
    fixture.detectChanges();
    expect(refresh.disabled).toBe(false);
    refresh.click();
    tick();
    http.expectOne((request) => request.url.endsWith('/automation-packages/bulk/refresh')).flush({});
    tick();
  }));

  it('requires package-write for bulk library refresh', fakeAsync(() => {
    const refresh = render(AP_RESOURCE_LIBRARY_ENTITY_ID, 'refresh');
    expect(refresh.disabled).toBe(true);
    rights.next(new Set(['automation-package-write']));
    fixture.detectChanges();
    expect(refresh.disabled).toBe(false);
    refresh.click();
    tick();
    http.expectOne((request) => request.url.endsWith('/automation-packages/resources/bulk/refresh')).flush({});
    tick();
  }));

  it('requires package-delete for bulk library deletion, independently of generic resource bulk deletion', fakeAsync(() => {
    const remove = render(AP_RESOURCE_LIBRARY_ENTITY_ID, 'delete');
    expect(remove.disabled).toBe(true);
    rights.next(new Set(['automation-package-delete']));
    fixture.detectChanges();
    expect(remove.disabled).toBe(false);
    remove.click();
    tick();
    http.expectOne((request) => request.url.endsWith('/automation-packages/resources/bulk/delete')).flush({});
    tick();
  }));
});
