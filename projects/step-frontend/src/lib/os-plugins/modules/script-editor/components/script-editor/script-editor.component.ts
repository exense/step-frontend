import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  model,
  signal,
  viewChild,
} from '@angular/core';
import {
  AceMode,
  AugmentedKeywordEditorService,
  convertScriptLanguageToAce,
  DialogsService,
  Keyword,
  KeywordExecutorService,
  ReloadableDirective,
  RichEditorChangeStatus,
  RichEditorComponent,
  ScriptLanguage,
} from '@exense/step-core';
import { filter, map, Observable, of, switchMap, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DeactivateComponentDataInterface } from '../../types/deactivate-component-data.interface';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FunctionScript } from '../../types/function-script.interface';

@Component({
  selector: 'step-script-editor',
  templateUrl: './script-editor.component.html',
  styleUrls: ['./script-editor.component.scss'],
  hostDirectives: [ReloadableDirective],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScriptEditorComponent implements AfterViewInit, DeactivateComponentDataInterface {
  private _keywordEditorApi = inject(AugmentedKeywordEditorService);
  private _keywordExecutor = inject(KeywordExecutorService);
  private _dialogsService = inject(DialogsService);
  private _activatedRoute = inject(ActivatedRoute);
  private _destroyRef = inject(DestroyRef);

  private richEditor = viewChild(RichEditorComponent);

  private keyword = toSignal(this._activatedRoute.data.pipe(map((data) => data['keyword'] as Keyword)));
  private keywordId = computed(() => this.keyword()?.id);
  private keywordId$ = toObservable(this.keywordId);
  private initialScript = signal('');

  protected readonly keywordName = computed(() => this.keyword()?.attributes?.['name'] ?? '');
  protected readonly syntaxMode = computed(() => {
    const keyword = this.keyword();
    const lang = (keyword as FunctionScript)?.scriptLanguage?.value as ScriptLanguage;
    return convertScriptLanguageToAce(lang) ?? AceMode.JAVASCRIPT;
  });

  protected readonly keywordScript = model('');
  protected readonly hasChanges = computed(() => {
    const initialScript = this.initialScript();
    const keywordScript = this.keywordScript();
    return initialScript !== keywordScript;
  });

  protected isAfterSave = signal(false);

  private effectResetAfterSaveFlag = effect(
    () => {
      const script = this.keywordScript();
      this.isAfterSave.set(false);
    },
    { allowSignalWrites: true },
  );

  protected readonly changeStatus = computed<RichEditorChangeStatus>(() => {
    const isAfterSave = this.isAfterSave();
    const hasChanges = this.hasChanges();
    if (isAfterSave) {
      return RichEditorChangeStatus.SAVED;
    }
    return hasChanges ? RichEditorChangeStatus.PENDING_CHANGES : RichEditorChangeStatus.NO_CHANGES;
  });

  ngAfterViewInit(): void {
    this.setupScriptInitialize();
  }

  save(): void {
    this.saveInternal().subscribe();
  }

  execute(): void {
    const keywordId = this.keywordId();
    if (!keywordId) {
      return;
    }
    this.saveInternal().subscribe((isSuccess) => {
      if (!isSuccess) {
        return;
      }
      this._keywordExecutor.executeKeyword(keywordId);
    });
  }

  canExit(): boolean | Observable<boolean> {
    if (!this.hasChanges()) {
      return true;
    }

    return this._dialogsService.showWarning('You have unsaved changes. Do you want to navigate anyway?');
  }

  private setupScriptInitialize(): void {
    this.keywordId$
      .pipe(
        filter((id) => !!id),
        switchMap((id) => this._keywordEditorApi.getFunctionScript(id!)),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((keywordScript) => {
        this.initialScript.set(keywordScript);
        this.keywordScript.set(keywordScript);
        this.richEditor()?.focusOnText();
      });
  }

  private saveInternal(): Observable<boolean> {
    const keywordId = this.keywordId();
    const script = this.keywordScript();
    if (!keywordId) {
      return of(false);
    }
    return this._keywordEditorApi.saveFunctionScript(keywordId, script).pipe(
      tap(() => {
        this.isAfterSave.set(true);
        this.initialScript.set(script);
      }),
      map(() => true),
    );
  }
}
