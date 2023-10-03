import { AfterViewInit, Component, ElementRef, inject, Input, OnDestroy, ViewChild } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AceMode,
  AJS_LOCATION,
  AJS_MODULE,
  AJS_ROOT_SCOPE,
  AugmentedKeywordEditorService,
  convertScriptLanguageToAce,
  Keyword,
  InteractivePlanExecutionService,
  KeywordsService,
  ScriptLanguage,
} from '@exense/step-core';
import { forkJoin, Observable, switchMap } from 'rxjs';
import * as ace from 'ace-builds';
import 'ace-builds/src-min-noconflict/theme-chrome.js';
import 'ace-builds/src-min-noconflict/mode-javascript.js';
import 'ace-builds/src-min-noconflict/mode-groovy.js';
import 'ace-builds/src-min-noconflict/mode-java.js';

@Component({
  selector: 'step-script-editor',
  templateUrl: './script-editor.component.html',
  styleUrls: ['./script-editor.component.scss'],
})
export class ScriptEditorComponent implements AfterViewInit, OnDestroy {
  private _$rootScope = inject(AJS_ROOT_SCOPE);
  private _$location = inject(AJS_LOCATION);
  private _keywordApi = inject(KeywordsService);
  private _keywordEditorApi = inject(AugmentedKeywordEditorService);
  private _interactiveApi = inject(InteractivePlanExecutionService);

  @ViewChild('editor', { static: false })
  private editorElement!: ElementRef<HTMLDivElement>;
  private editor?: ace.Ace.Editor;

  @Input() functionId!: string;

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
    this.saveInternal()
      .pipe(switchMap(() => this._interactiveApi.startFunctionTestingSession(this.functionId)))
      .subscribe((result) => {
        (this._$rootScope as any).planEditorInitialState = {
          interactive: true,
          selectedNode: result.callFunctionId,
        };
        this._$location.path('/root/plans/editor/' + result.planId);
      });
  }

  private setupEditor(): void {
    this.editor = ace.edit(this.editorElement.nativeElement);
    this.editor.setTheme('ace/theme/chrome');
  }

  private loadKeyword(): void {
    forkJoin([
      this._keywordApi.getFunctionById(this.functionId),
      this._keywordEditorApi.getFunctionScript(this.functionId),
    ]).subscribe(([keyword, keywordScript]) => {
      this.keyword = keyword;
      this.editor!.getSession().setMode(this.determineKeywordMode());
      this.editor!.setValue(keywordScript);
    });
  }

  private determineKeywordMode(): AceMode {
    const lang = (this.keyword as any)?.scriptLanguage?.value as ScriptLanguage;
    return convertScriptLanguageToAce(lang) ?? AceMode.javascript;
  }

  private saveInternal(): Observable<void> {
    return this._keywordEditorApi.saveFunctionScript(this.functionId, this.editor!.getValue());
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepScriptEditor', downgradeComponent({ component: ScriptEditorComponent }));
