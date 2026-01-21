import { ComponentFixture, fakeAsync, flush, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { AutomationPackageInfoComponent } from './automation-package-info.component';
import { AutomationPackageCommonModule } from '../../automation-package-common.module';
import { AugmentedAutomationPackagesService, AutomationPackage, provideTestStepApi } from '@exense/step-core';
import { AutomationPackageChildEntity } from '../../types/automation-package-child-entity';
import { v4 } from 'uuid';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

interface ChildEntity extends AutomationPackageChildEntity {}

const PACKAGE_ID = v4();

const PACKAGE_CHILD: ChildEntity = {
  customFields: {
    automationPackageId: PACKAGE_ID,
  },
};

const AUTOMATION_PACKAGE: AutomationPackage = {
  id: PACKAGE_ID,
  attributes: {
    name: 'TEST PACKAGE',
  },
};

describe('AutomationPackageInfoComponent', () => {
  let fixture: ComponentFixture<AutomationPackageInfoComponent<ChildEntity>>;
  let api: AugmentedAutomationPackagesService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutomationPackageCommonModule],
      providers: [provideTestStepApi()],
    }).compileComponents();
    fixture = TestBed.createComponent(AutomationPackageInfoComponent);
    api = TestBed.inject(AugmentedAutomationPackagesService);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('Load package', fakeAsync(() => {
    const spySearchByIds = jest.spyOn(api, 'searchByIDs').mockImplementation((ids) => of([AUTOMATION_PACKAGE]));

    let div = fixture.debugElement.query(By.css('div'));
    expect(div.nativeElement.innerHTML).toBe('');
    expect(spySearchByIds).not.toHaveBeenCalled();

    fixture.componentRef.setInput('context', PACKAGE_CHILD);
    fixture.detectChanges();
    // When automationPackage is loaded inside AutomationPackageInfoComponent,
    // bulkRequest pipe operator is used. In current case it is initialized with default parameters.
    // Default parameters have these values: startDue - 500 and intervalDuration - 1500
    // That is why it's required to await 2000ms (500 + 1500) before checking the result.
    tick(2000);
    fixture.detectChanges();
    expect(spySearchByIds).toHaveBeenCalledWith([PACKAGE_ID]);

    div = fixture.debugElement.query(By.css('div'));
    expect(div.nativeElement.innerHTML).toBe(AUTOMATION_PACKAGE.attributes!['name']);
  }));
});
