import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, Subject, throwError } from 'rxjs';
import { DialogsService } from '../../../basics/step-basics.module';
import { FilePickerDataProviderService } from '../../injectables/file-picker-data-provider.service';
import { SelectionMode } from '../../types/selection-mode.enum';
import { FilePickerModalComponent } from './file-picker-modal.component';
import { DirectoryListing } from '../../../../client/step-client-module';

describe('FilePickerModalComponent directory selection', () => {
  let component: FilePickerModalComponent;
  const dialog = { close: jest.fn() };
  const provider = { getRoots: () => of([]), listDirectory: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    provider.listDirectory.mockReturnValue(of({ path: '/home', parentPath: '/', entries: [] }));
    TestBed.configureTestingModule({
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { selectionMode: SelectionMode.DIRECTORY } },
        { provide: MatDialogRef, useValue: dialog },
        { provide: ElementRef, useValue: new ElementRef(document.createElement('div')) },
        { provide: FilePickerDataProviderService, useValue: provider },
        { provide: DialogsService, useValue: {} },
      ],
    });
    component = TestBed.runInInjectionContext(() => new FilePickerModalComponent());
    component.ngOnInit();
  });

  it('selects the current directory, including an empty folder', () => {
    expect(component['canApply']()).toBe(true);
    component['apply']();
    expect(dialog.close).toHaveBeenCalledWith({ filePath: '/home', packageName: undefined });
  });

  it('validates and selects a pasted path without requiring Enter', () => {
    provider.listDirectory.mockReturnValue(of({ path: '/home/my-package', entries: [] }));
    component['locationControl'].setValue('/home/my-package/');
    component['apply']();
    expect(provider.listDirectory).toHaveBeenLastCalledWith('/home/my-package', { dirsOnly: true });
    expect(dialog.close).toHaveBeenCalledWith({ filePath: '/home/my-package', packageName: undefined });
  });

  it('can select the directory after navigating with Enter', () => {
    provider.listDirectory.mockReturnValue(of({ path: 'C:\\Packages', entries: [] }));
    component['locationControl'].setValue('C:\\Packages\\');
    component['loadLocation']();
    component['apply']();
    expect(provider.listDirectory).toHaveBeenLastCalledWith('C:/Packages', { dirsOnly: true });
    expect(dialog.close).toHaveBeenCalledWith({ filePath: 'C:\\Packages', packageName: undefined });
  });

  it('keeps an invalid pasted path editable and does not select the previous folder', () => {
    provider.listDirectory.mockReturnValue(throwError(() => new Error('Not a directory')));
    component['locationControl'].setValue('/missing');
    component['apply']();
    expect(dialog.close).not.toHaveBeenCalled();
    expect(component['locationControl'].value).toBe('/missing');
  });

  it('selects a clicked folder after editing the location', () => {
    component['locationControl'].setValue('/missing');
    component['selectFile']({ path: '/home/package', directory: true });
    component['apply']();
    expect(dialog.close).toHaveBeenCalledWith({ filePath: '/home/package', packageName: undefined });
  });

  it('selects a filesystem root from the roots list', () => {
    component['currentDirectory'].set(null);
    component['showingRoots'].set(true);
    component['locationControl'].setValue('');
    component['selectFile']({ path: 'C:\\', directory: true });
    expect(component['canApply']()).toBe(true);
    component['apply']();
    expect(dialog.close).toHaveBeenCalledWith({ filePath: 'C:\\', packageName: undefined });
  });

  it('ignores a previous navigation response after a newer navigation', () => {
    const stale = new Subject<DirectoryListing>();
    provider.listDirectory.mockReturnValueOnce(stale);
    component['locationControl'].setValue('/old');
    component['loadLocation']();
    provider.listDirectory.mockReturnValue(of({ path: '/new', entries: [] }));
    component['locationControl'].setValue('/new');
    component['loadLocation']();
    stale.next({ path: '/old', entries: [] });
    expect(component['currentDirectory']()).toBe('/new');
  });

  it('preserves a path pasted while navigation is pending and does not confirm the stale path', () => {
    const pending = new Subject<DirectoryListing>();
    provider.listDirectory.mockReturnValueOnce(pending);
    component['locationControl'].setValue('/old');
    component['apply']();
    component['locationControl'].setValue('/new');
    pending.next({ path: '/old', entries: [] });
    expect(component['locationControl'].value).toBe('/new');
    expect(dialog.close).not.toHaveBeenCalled();
    provider.listDirectory.mockReturnValue(of({ path: '/new', entries: [] }));
    component['apply']();
    expect(dialog.close).toHaveBeenCalledWith({ filePath: '/new', packageName: undefined });
  });
});
