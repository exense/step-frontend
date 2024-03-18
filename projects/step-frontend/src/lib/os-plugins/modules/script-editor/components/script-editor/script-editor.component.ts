import { AfterViewInit, Component, inject, viewChild } from '@angular/core';
import {
  AceMode,
  AugmentedKeywordEditorService,
  convertScriptLanguageToAce,
  DialogsService,
  Keyword,
  KeywordExecutorService,
  KeywordsService,
  RichEditorComponent,
  ScriptLanguage,
} from '@exense/step-core';
import { forkJoin, Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DeactivateComponentDataInterface } from '../../types/deactivate-component-data.interface';

@Component({
  selector: 'step-script-editor',
  templateUrl: './script-editor.component.html',
  styleUrls: ['./script-editor.component.scss'],
})
export class ScriptEditorComponent implements AfterViewInit, DeactivateComponentDataInterface {
  private _keywordApi = inject(KeywordsService);
  private _keywordEditorApi = inject(AugmentedKeywordEditorService);
  private _keywordExecutor = inject(KeywordExecutorService);
  private _dialogsService = inject(DialogsService);
  private initialScript?: string;

  private richEditor = viewChild(RichEditorComponent);

  protected _functionId = inject(ActivatedRoute).snapshot.params['id']! as string;

  protected keyword?: Keyword;
  protected keywordScript?: string;
  protected syntaxMode?: AceMode;

  noChanges = true;
  isAfterSave = false;

  ngAfterViewInit(): void {
    this.loadKeyword();
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

  handleScriptChange(keywordScript: string): void {
    this.isAfterSave = false;
    this.keywordScript = keywordScript;
    if (keywordScript === this.initialScript) {
      this.noChanges = true;
    } else {
      this.noChanges = false;
    }
  }

  private loadKeyword(): void {
    forkJoin([
      this._keywordApi.getFunctionById(this._functionId),
      this._keywordEditorApi.getFunctionScript(this._functionId),
    ]).subscribe(([keyword, keywordScript]) => {
      this.keyword = keyword;
      this.initialScript = keywordScript;
      this.keywordScript = keywordScript;
      this.syntaxMode = this.determineKeywordMode();
      this.richEditor()?.focusOnText();
    });
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
    this.refreshInitVars(this.keywordScript);
    return this._keywordEditorApi.saveFunctionScript(this._functionId, this.keywordScript);
  }
}
