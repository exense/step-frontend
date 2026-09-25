import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  FilePickerService,
  FilesystemService,
  HttpOverrideResponseInterceptorService,
  IdeService,
  ProposeDirectoryResponse,
  SelectionMode,
} from '@exense/step-core';
import { of, Subject, throwError } from 'rxjs';
import { CreatePackageDialogComponent } from './create-package-dialog.component';

describe('CreatePackageDialogComponent', () => {
  let component: CreatePackageDialogComponent;
  const proposal: ProposeDirectoryResponse = { directory: '/home/Package_Name', warnings: [], errors: [] };
  const api = { initializeNewAp: jest.fn() };
  const filesystem = { proposeApDirectory: jest.fn(), listDirectory: () => of({ path: '/home' }) };
  const dialog = { close: jest.fn(), disableClose: false };
  const picker = { showFilePicker: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    filesystem.proposeApDirectory.mockReturnValue(of(proposal));
    api.initializeNewAp.mockReturnValue(of(null));
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [
        { provide: IdeService, useValue: api },
        { provide: FilesystemService, useValue: filesystem },
        { provide: FilePickerService, useValue: picker },
        { provide: MatDialogRef, useValue: dialog },
        { provide: HttpOverrideResponseInterceptorService, useValue: { overrideInterceptor: jest.fn() } },
      ],
    });
    component = TestBed.runInInjectionContext(() => new CreatePackageDialogComponent());
    component.ngOnInit();
  });

  it('initializes the backend-proposed path while retaining the package name and allowing warnings', fakeAsync(() => {
    filesystem.proposeApDirectory.mockReturnValue(of({ ...proposal, warnings: ['Directory name was sanitized'] }));
    component['form'].controls.name.setValue('Package/Name');
    tick(300);
    expect(filesystem.proposeApDirectory).toHaveBeenCalledWith({
      existingParentDirectory: '/home',
      apName: 'Package/Name',
    });
    component['create']();
    expect(api.initializeNewAp).toHaveBeenCalledWith('/home/Package_Name', 'Package/Name');
    expect(dialog.close).toHaveBeenCalledWith(true);
  }));

  it('cancels stale validation immediately and blocks creation until the latest response', fakeAsync(() => {
    const oldResponse = new Subject<ProposeDirectoryResponse>();
    filesystem.proposeApDirectory.mockReturnValueOnce(oldResponse);
    component['form'].controls.name.setValue('Old');
    tick(300);
    component['form'].controls.name.setValue('New');
    oldResponse.next(proposal);
    component['create']();
    expect(api.initializeNewAp).not.toHaveBeenCalled();
    expect(component['proposal']()).toBeUndefined();
    tick(300);
    expect(filesystem.proposeApDirectory).toHaveBeenLastCalledWith({ existingParentDirectory: '/home', apName: 'New' });
  }));

  it('blocks backend errors and invalid names', fakeAsync(() => {
    filesystem.proposeApDirectory.mockReturnValue(of({ ...proposal, errors: ['Target is a file'] }));
    component['form'].controls.name.setValue('Package');
    tick(300);
    component['create']();
    expect(api.initializeNewAp).not.toHaveBeenCalled();
    for (const name of ['', '   ', '.', '..', ' .. ']) {
      component['form'].controls.name.setValue(name);
      component['create']();
      tick(300);
      expect(component['form'].invalid).toBe(true);
    }
    expect(api.initializeNewAp).not.toHaveBeenCalled();
  }));

  it('keeps creation failures in the dialog and permits retry', fakeAsync(() => {
    api.initializeNewAp.mockReturnValueOnce(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { errorMessage: 'Directory already contains an automation package descriptor' },
          }),
      ),
    );
    component['form'].controls.name.setValue('Package');
    tick(300);
    component['create']();
    expect(dialog.close).not.toHaveBeenCalled();
    expect(component['errors']()).toEqual(['Directory already contains an automation package descriptor']);
    expect(component['creating']()).toBe(false);
    expect(component['form'].enabled).toBe(true);
    component['create']();
    expect(dialog.close).toHaveBeenCalledWith(true);
  }));

  it('recovers from a failed location check when the location is corrected', fakeAsync(() => {
    filesystem.proposeApDirectory.mockReturnValueOnce(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { errorMessage: 'Parent directory does not exist' },
          }),
      ),
    );
    component['form'].setValue({ name: 'Package', location: '/missing' });
    tick(300);
    expect(component['errors']()).toEqual(['Parent directory does not exist']);
    component['form'].controls.location.setValue('/home');
    tick(300);
    expect(component['errors']()).toEqual([]);
    expect(component['proposal']()).toEqual(proposal);
  }));

  it('opens a separate folder picker and updates the containing location', () => {
    picker.showFilePicker.mockReturnValue(of({ filePath: '/other' }));
    component['browse']();
    expect(picker.showFilePicker).toHaveBeenCalledWith('Select Location', {
      initialDirectory: '/home',
      selectionMode: SelectionMode.DIRECTORY,
      confirmButtonLabel: 'Select Folder',
    });
    expect(component['form'].controls.location.value).toBe('/other');
  });

  it('renders the proposed directory with warning feedback', fakeAsync(() => {
    filesystem.proposeApDirectory.mockReturnValue(of({ ...proposal, warnings: ['Directory already exists'] }));
    const fixture = TestBed.createComponent(CreatePackageDialogComponent);
    fixture.detectChanges();
    fixture.componentInstance['form'].controls.name.setValue('Package');
    tick(300);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('The automation package will be created in /home/Package_Name');
    expect(element.querySelector('#package-name')?.classList.contains('has-warnings')).toBe(true);
    expect(element.querySelector('.warning')?.textContent).toContain('Directory already exists');
  }));

  it('prevents duplicate creation and closing with Escape while creation is pending', fakeAsync(() => {
    const pendingCreation = new Subject<null>();
    api.initializeNewAp.mockReturnValue(pendingCreation);
    const fixture = TestBed.createComponent(CreatePackageDialogComponent);
    fixture.detectChanges();
    fixture.componentInstance['form'].controls.name.setValue('Package');
    tick(300);
    fixture.componentInstance['create']();
    fixture.componentInstance['create']();
    fixture.detectChanges();
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape' }));
    expect(api.initializeNewAp).toHaveBeenCalledTimes(1);
    expect(dialog.close).not.toHaveBeenCalled();
    pendingCreation.next(null);
    pendingCreation.complete();
    expect(dialog.close).toHaveBeenCalledWith(true);
  }));
});
