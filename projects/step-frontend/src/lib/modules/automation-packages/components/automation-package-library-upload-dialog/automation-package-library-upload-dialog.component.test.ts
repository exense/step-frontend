import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { AuthService, PrivateApplicationService, provideTestStepApi } from '@exense/step-core';
import { BehaviorSubject, map, of } from 'rxjs';
import { AutomationPackageLibraryUploadDialogComponent } from './automation-package-library-upload-dialog.component';

describe('Automation package library upload permissions', () => {
  let fixture: ComponentFixture<AutomationPackageLibraryUploadDialogComponent>;
  let http: HttpTestingController;
  const rights = new BehaviorSubject(new Set(['resource-write']));

  beforeEach(() => {
    rights.next(new Set(['resource-write']));
    TestBed.configureTestingModule({
      imports: [AutomationPackageLibraryUploadDialogComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        provideTestStepApi(),
        provideHttpClientTesting(),
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: { close: jest.fn() } },
        {
          provide: AuthService,
          useValue: {
            hasRight: (right: string) => rights.value.has(right),
            hasRight$: (right: string) => rights.pipe(map((current) => current.has(right))),
          },
        },
        { provide: PrivateApplicationService, useValue: { getAllRepositoriesCanonicalParameters: () => of([]) } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    fixture?.destroy();
    http.verify();
  });

  it('requires package-write for both Upload and Enter and uploads through the package resource service', fakeAsync(() => {
    fixture = TestBed.createComponent(AutomationPackageLibraryUploadDialogComponent);
    fixture.detectChanges();
    const file: HTMLInputElement = fixture.nativeElement.querySelector('input[type="file"]');
    Object.defineProperty(file, 'files', { value: [new File(['library'], 'library.jar')] });
    file.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const upload = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>).find(
      (button) => button.textContent?.trim() === 'Upload',
    )!;
    expect(upload.disabled).toBe(true);
    fixture.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    tick();
    http.expectNone((request) => request.url.endsWith('/automation-packages/resources'));
    rights.next(new Set(['automation-package-write']));
    fixture.detectChanges();
    expect(upload.disabled).toBe(false);
    upload.click();
    tick();
    const request = http.expectOne((value) => value.url.endsWith('/automation-packages/resources'));
    expect(request.request.method).toBe('POST');
    request.flush(new ArrayBuffer(0));
    tick();
  }));
});
