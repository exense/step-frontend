import { AfterViewInit, Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import {
  AceMode,
  AugmentedKeywordEditorService,
  convertScriptLanguageToAce,
  DialogsService,
  Keyword,
  KeywordExecutorService,
  KeywordsService,
  ScriptLanguage,
} from '@exense/step-core';
import { forkJoin, Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import * as ace from 'ace-builds';
import 'ace-builds/src-min-noconflict/theme-chrome.js';
import 'ace-builds/src-min-noconflict/mode-javascript.js';
import 'ace-builds/src-min-noconflict/mode-groovy.js';
import 'ace-builds/src-min-noconflict/mode-java.js';
import 'ace-builds/src-min-noconflict/ext-searchbox';
import { DeactivateComponentDataInterface } from '../../types/deactivate-component-data.interface';

@Component({
  selector: 'step-script-editor',
  templateUrl: './script-editor.component.html',
  styleUrls: ['./script-editor.component.scss'],
})
export class ScriptEditorComponent implements AfterViewInit, OnDestroy, DeactivateComponentDataInterface {
  private _keywordApi = inject(KeywordsService);
  private _keywordEditorApi = inject(AugmentedKeywordEditorService);
  private _keywordExecutor = inject(KeywordExecutorService);
  private _dialogsService = inject(DialogsService);
  private initialScript?: String;
  private subscriptions: Array<Observable<any>> = [];

  @ViewChild('editor', { static: false })
  private editorElement!: ElementRef<HTMLDivElement>;
  private editor?: ace.Ace.Editor;

  protected _functionId = inject(ActivatedRoute).snapshot.params['id']! as string;

  protected keyword?: Keyword;

  noChanges = true;
  isAfterSave = false;

  ngAfterViewInit(): void {
    this.setupEditor();
    this.loadKeyword();
  }

  ngOnDestroy(): void {
    this.editor!.destroy();
  }

  save(): void {
    this.saveInternal().subscribe();
  }

  execute(): void {
    this.saveInternal().subscribe(() => this._keywordExecutor.executeKeyword(this._functionId));
  }

  canExit(): boolean | Observable<boolean> {
    if (this.noChanges) {
      return true;
    } else {
      return this._dialogsService.showWarning('You have unsaved changes. Do you want to navigate anyway?');
    }
  }

  private setupEditor(): void {
    this.editor = ace.edit(this.editorElement.nativeElement);
    this.editor.setTheme('ace/theme/chrome');
  }

  private loadKeyword(): void {
    forkJoin([
      this._keywordApi.getFunctionById(this._functionId),
      this._keywordEditorApi.getFunctionScript(this._functionId),
    ]).subscribe(([keyword, keywordScript]) => {
      this.keyword = keyword;
      this.initialScript = keywordScript;
      this.editor!.getSession().setMode(this.determineKeywordMode());
      this.editor!.setValue(keywordScript);
      this.focusOnText();
      this.trackChanges();
    });
  }

  private trackChanges(): void {
    this.editor!.on('change', (value) => {
      this.isAfterSave = false;
      if (this.editor!.getValue() === this.initialScript) {
        this.noChanges = true;
      } else {
        this.noChanges = false;
      }
    });
  }

  private focusOnText(): void {
    this.editor!.focus();
  }

  private refreshInitVars(val?: string): void {
    this.isAfterSave = true;
    this.noChanges = true;
    this.initialScript = val;
  }

  private determineKeywordMode(): AceMode {
    const lang = (this.keyword as any)?.scriptLanguage?.value as ScriptLanguage;
    return convertScriptLanguageToAce(lang) ?? AceMode.JAVASCRIPT;
  }

  private saveInternal(): Observable<void> {
    const editorValue = this.editor!.getValue();
    this.refreshInitVars(editorValue);
    return this._keywordEditorApi.saveFunctionScript(this._functionId, editorValue);
  }
}
