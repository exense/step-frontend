import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FilePickerService,
  FilesystemService,
  HttpOverrideResponseInterceptorService,
  IdeService,
  ProposeDirectoryResponse,
  SelectionMode,
  StepBasicsModule,
} from '@exense/step-core';
import { catchError, defer, EMPTY, finalize, map, Observable, of, startWith, switchMap, timer } from 'rxjs';

@Component({
  selector: 'step-create-package-dialog',
  imports: [StepBasicsModule],
  templateUrl: './create-package-dialog.component.html',
  styleUrl: './create-package-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CreatePackageDialogComponent implements OnInit {
  protected readonly _dialogRef = inject<MatDialogRef<CreatePackageDialogComponent, boolean>>(MatDialogRef);
  private _ideApi = inject(IdeService);
  private _filesystem = inject(FilesystemService);
  private _filePicker = inject(FilePickerService);
  private _interceptorOverride = inject(HttpOverrideResponseInterceptorService);
  private _destroyRef = inject(DestroyRef);
  private _fb = inject(FormBuilder).nonNullable;

  protected readonly form = this._fb.group({
    name: [
      '',
      [
        (control: AbstractControl<string>): ValidationErrors | null =>
          control.value.trim() ? null : { required: true },
        Validators.pattern(/^(?!\s*\.{1,2}\s*$)[\s\S]*$/),
      ],
    ],
    location: ['', [Validators.required, Validators.pattern(/\S/)]],
  });
  protected readonly proposal = signal<ProposeDirectoryResponse | undefined>(undefined);
  protected readonly errors = signal<string[]>([]);
  protected readonly validating = signal(false);
  protected readonly creating = signal(false);

  ngOnInit(): void {
    this.form.valueChanges
      .pipe(
        startWith(this.form.getRawValue()),
        switchMap(() => {
          this.proposal.set(undefined);
          this.errors.set([]);
          this.validating.set(this.form.valid);
          if (this.form.invalid) {
            return EMPTY;
          }
          const { name, location } = this.form.getRawValue();
          return timer(300).pipe(
            switchMap(() =>
              this.withInlineErrors(() =>
                this._filesystem.proposeApDirectory({ existingParentDirectory: location.trim(), apName: name }),
              ),
            ),
            catchError((error: unknown) => {
              this.errors.set([this.errorMessage(error)]);
              this.validating.set(false);
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((proposal) => {
        this.proposal.set(proposal);
        this.errors.set(proposal.errors);
        this.validating.set(false);
      });

    this.withInlineErrors(() => this._filesystem.listDirectory())
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (directory) => {
          if (!this.form.controls.location.dirty && !this.form.controls.location.value) {
            this.form.controls.location.setValue(directory.path ?? '');
          }
        },
        error: (error: unknown) => this.errors.set([this.errorMessage(error)]),
      });
  }

  protected browse(): void {
    this._filePicker
      .showFilePicker('Select Location', {
        initialDirectory: this.form.controls.location.value.trim(),
        selectionMode: SelectionMode.DIRECTORY,
        confirmButtonLabel: 'Select Folder',
      })
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((result) => {
        if (result) {
          this.form.controls.location.setValue(result.filePath);
          this.form.controls.location.markAsDirty();
        }
      });
  }

  protected create(): void {
    this.form.markAllAsTouched();
    const proposal = this.proposal();
    if (this.form.invalid || this.validating() || this.creating() || !proposal?.directory || proposal.errors.length) {
      return;
    }
    this.creating.set(true);
    this.form.disable({ emitEvent: false });
    this.withInlineErrors(() => this._ideApi.initializeNewAp(proposal.directory, this.form.controls.name.value))
      .pipe(
        finalize(() => {
          this.creating.set(false);
          this.form.enable({ emitEvent: false });
        }),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe({
        next: () => this._dialogRef.close(true),
        error: (error: unknown) => this.errors.set([this.errorMessage(error)]),
      });
  }

  private withInlineErrors<T>(request: () => Observable<T>): Observable<T> {
    return defer(() => {
      let requestError: unknown;
      this._interceptorOverride.overrideInterceptor(
        catchError((error: unknown) => {
          requestError = error;
          return of(new HttpResponse({ body: null }));
        }),
      );
      return request().pipe(
        map((result) => {
          if (requestError) {
            throw requestError;
          }
          return result;
        }),
      );
    });
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const message: unknown = error.error?.errorMessage ?? error.error?.message ?? error.error;
      if (typeof message === 'string' && message) {
        return message;
      }
    }
    return error instanceof Error ? error.message : 'Unable to access the package location. Please try again.';
  }
}
