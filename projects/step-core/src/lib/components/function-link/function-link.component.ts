import { Component, EventEmitter, inject, Input, Optional, Output } from '@angular/core';
import { map, of, switchMap } from 'rxjs';
import { Function as KeywordFunction } from '../../client/step-client-module';
import { CustomComponent } from '../../modules/custom-registeries/custom-registries.module';
import { CustomColumnOptions } from '../../modules/table/table.module';
import { FunctionLinkDialogService } from './function-link-dialog.service';
import { MultipleProjectsService } from '../../modules/basics/services/multiple-projects.service';
import { a1Promise2Observable, AJS_LOCATION, DialogsService } from '../../shared';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'step-function-link',
  templateUrl: './function-link.component.html',
  styleUrls: ['./function-link.component.scss'],
})
export class FunctionLinkComponent implements CustomComponent {
  private _location = inject(AJS_LOCATION);
  private _functionLinkDialogService = inject(FunctionLinkDialogService, { optional: true });
  private _customColumnOptions = inject(CustomColumnOptions, { optional: true });
  private _multipleProjects = inject(MultipleProjectsService);
  private _dialogs = inject(DialogsService);

  @Input() context?: KeywordFunction;
  @Output() edit = new EventEmitter<void>();

  readonly noLink$ = (this._customColumnOptions?.options$ || of([])).pipe(
    map((options) => options.includes('noEditorLink'))
  );

  editFunction(): void {
    const id = this.context?.id;
    if (!this.context?.id || !this._functionLinkDialogService) {
      return;
    }

    const editorPath$ = this._functionLinkDialogService.getFunctionEditorPath(this.context.id);

    if (this._multipleProjects.isEntityBelongsToCurrentProject(this.context)) {
      editorPath$.subscribe((path) => {
        if (path) {
          this._location.path(path);
          this.edit.emit();
        }
      });
      return;
    }

    a1Promise2Observable(
      this._dialogs.showWarning('Selected keyword belongs to another project, do you want to switch?')
    )
      .pipe(
        switchMap(() => editorPath$),
        catchError(() => of(undefined))
      )
      .subscribe((path) => {
        if (!path) {
          return;
        }
        const project = this._multipleProjects.getEntityProject(this.context!);
        if (!project) {
          return;
        }
        this._multipleProjects.switchToProject(project, path);
      });
  }
}
