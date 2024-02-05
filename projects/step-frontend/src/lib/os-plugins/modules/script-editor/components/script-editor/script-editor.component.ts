import { AfterViewInit, Component, ElementRef, HostListener, inject, OnDestroy, ViewChild } from '@angular/core';
import {
  AceMode,
  AugmentedKeywordEditorService,
  convertScriptLanguageToAce,
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

@Component({
  selector: 'step-script-editor',
  templateUrl: './script-editor.component.html',
  styleUrls: ['./script-editor.component.scss'],
})
export class ScriptEditorComponent implements AfterViewInit, OnDestroy {
  private _keywordApi = inject(KeywordsService);
  private _keywordEditorApi = inject(AugmentedKeywordEditorService);
  private _keywordExecutor = inject(KeywordExecutorService);

  @ViewChild('editor', { static: false })
  private editorElement!: ElementRef<HTMLDivElement>;
  private editor?: ace.Ace.Editor;

  protected _functionId = inject(ActivatedRoute).snapshot.params['id']! as string;

  protected keyword?: Keyword;

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
      this.editor!.getSession().setMode(this.determineKeywordMode());
      this.editor!.setValue(keywordScript);
      this.focusOnText();
    });
  }

  private focusOnText(): void {
    this.editor!.focus();
  }

  private determineKeywordMode(): AceMode {
    const lang = (this.keyword as any)?.scriptLanguage?.value as ScriptLanguage;
    return convertScriptLanguageToAce(lang) ?? AceMode.JAVASCRIPT;
  }

  private saveInternal(): Observable<void> {
    return this._keywordEditorApi.saveFunctionScript(this._functionId, this.editor!.getValue());
  }
}
