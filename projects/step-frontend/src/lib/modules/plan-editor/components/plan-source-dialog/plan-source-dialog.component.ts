import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AceMode } from '@exense/step-core';
import * as ace from 'ace-builds';
import 'ace-builds/src-min-noconflict/theme-chrome.js';
import 'ace-builds/src-min-noconflict/mode-yaml.js';
import { from } from 'rxjs';

@Component({
  selector: 'step-plan-source',
  templateUrl: './plan-source-dialog.component.html',
  styleUrls: ['./plan-source-dialog.component.scss'],
})
export class PlanSourceDialogComponent implements AfterViewInit, OnDestroy {
  private _snackBar = inject(MatSnackBar);
  private _planSource = inject<string>(MAT_DIALOG_DATA);
  private _clipboard = inject(DOCUMENT).defaultView!.navigator.clipboard;

  @ViewChild('editor', { static: false })
  private editorElement!: ElementRef<HTMLDivElement>;

  private editor?: ace.Ace.Editor;

  ngAfterViewInit(): void {
    ace.require('ace/ext/language_tools');
    this.editor = ace.edit(this.editorElement.nativeElement);
    this.editor.setTheme('ace/theme/chrome');
    this.editor.getSession().setMode(AceMode.YAML);
    this.editor.getSession().setUseWorker(false);
    this.editor.setReadOnly(true);
    this.editor.setValue(this._planSource, 1);
    this.editor.focus();
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  copyToClipboard(): void {
    from(this._clipboard.writeText(this._planSource)).subscribe(() => {
      this._snackBar.open(`Plan's YAML copied to clipboard.`, 'dismiss');
    });
  }
}
