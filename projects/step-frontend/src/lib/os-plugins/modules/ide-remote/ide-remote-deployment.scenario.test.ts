import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  IDE_MODE,
  IdeStateStrategyService,
  provideTestStepApi,
  RemoteDefaults,
  RemoteDeploymentRequest,
} from '@exense/step-core';
import { IdeRemoteOperationDialogComponent } from './components/ide-remote-operation-dialog/ide-remote-operation-dialog.component';
import { IdeRemoteDefaultsService } from './services/ide-remote-defaults.service';

describe('Studio remote deployment properties', () => {
  let http: HttpTestingController;
  let fixture: ComponentFixture<IdeRemoteOperationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdeRemoteOperationDialogComponent, NoopAnimationsModule],
      providers: [
        provideTestStepApi(),
        provideHttpClientTesting(),
        { provide: IDE_MODE, useValue: true },
        { provide: MAT_DIALOG_DATA, useValue: { operation: 'DEPLOY' } },
        { provide: MatDialogRef, useValue: { close: jest.fn() } },
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    TestBed.inject(IdeStateStrategyService).useStrategy({
      currentPackage: signal({ name: 'Studio package' }),
      inProgress: signal(false),
    });
  });

  afterEach(() => {
    fixture?.destroy();
    http.verify();
  });

  function openDialog(defaults: RemoteDefaults): HTMLElement {
    TestBed.inject(IdeRemoteDefaultsService).initialize();
    flushMicrotasks();
    http
      .match((request) => request.url.endsWith('/app/repositories/parameters'))
      .forEach((request) => request.flush({}));
    const request = http.expectOne((request) => request.url.endsWith('/local/studio/remote-defaults'));
    expect(request.request.method).toBe('GET');
    request.flush(defaults);
    flushMicrotasks();
    fixture = TestBed.createComponent(IdeRemoteOperationDialogComponent);
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  it('shows the deployment defaults before submitting the full package with those settings', fakeAsync(() => {
    const deploy: RemoteDeploymentRequest = {
      connection: {
        url: 'https://deploy.example.test',
        projectName: 'Deployment project',
        stepUser: 'deployment-user',
        token: 'deployment-secret',
      },
      library: 'deployment-library',
      async: false,
      versionName: 'release-42',
      activationExpression: 'env == "production"',
      forceRefreshOfSnapshots: true,
      deploymentTimeout: 0,
      plansAttributes: { team: 'QA' },
      keywordsAttributes: { owner: 'Platform' },
      tokenSelectionCriteria: { agent: 'Linux' },
      executeKeywordsOnController: false,
    };
    const element = openDialog({
      deploy,
      execute: {
        connection: { url: 'https://execute.example.test', stepUser: 'execution-user' },
        library: 'execution-library',
        executionParameters: { executionOnly: 'hidden' },
      },
    });
    expect(element.textContent).toContain('https://deploy.example.test');
    expect(element.textContent).toContain('Deployment project');
    expect(element.textContent).not.toContain('execution-user');
    expect(element.textContent).not.toContain('execution-library');
    expect(element.textContent).not.toContain('deployment-secret');

    const properties = element.querySelector('details');
    expect(properties?.querySelector('summary')?.textContent).toContain('Remote deployment properties');
    const rows = Array.from(properties!.querySelectorAll('.option'), (row) => [
      row.querySelector('span')?.textContent?.trim(),
      row.querySelector('strong')?.textContent?.trim(),
    ]);
    expect(rows).toEqual([
      ['Step user', 'deployment-user'],
      ['Library', 'deployment-library'],
      ['Asynchronous deployment', 'No'],
      ['Version name', 'release-42'],
      ['Activation expression', 'env == "production"'],
      ['Force refresh of snapshots', 'Yes'],
      ['Deployment timeout', '0'],
      ['Execute keywords on controller', 'No'],
      ['team', 'QA'],
      ['owner', 'Platform'],
      ['agent', 'Linux'],
    ]);
    expect(properties!.textContent).toContain('Plan attributes');
    expect(properties!.textContent).toContain('Keyword attributes');
    expect(properties!.textContent).toContain('Token selection criteria');

    const deployButton = Array.from(element.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Deploy',
    )!;
    expect(deployButton.disabled).toBe(false);
    deployButton.click();
    flushMicrotasks();
    const request = http.expectOne((request) => request.url.endsWith('/local/studio/remote-deploy'));
    expect(request.request.method).toBe('POST');
    expect(JSON.parse(request.request.body)).toEqual(deploy);
    request.flush({ status: 'UPDATED' });
    flushMicrotasks();
    fixture.detectChanges();
    expect(element.textContent).toContain('Deployment succeeded.');
    expect(element.querySelector('details')).toBeNull();
  }));

  it('explains when no additional deployment properties are configured', fakeAsync(() => {
    const element = openDialog({ deploy: { connection: { url: 'https://deploy.example.test' } } });
    const properties = element.querySelector('details');
    expect(properties?.querySelector('summary')?.textContent).toContain('Remote deployment properties');
    expect(properties!.textContent).toContain('No additional remote deployment properties are configured.');
    expect(properties!.querySelectorAll('.option')).toHaveLength(0);
  }));
});
