import {
  afterNextRender,
  AfterRenderRef,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  Input,
  linkedSignal,
  OnChanges,
  signal,
  SimpleChanges,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { NgControl } from '@angular/forms';
import { catchError, defer, map, of, startWith, switchMap } from 'rxjs';
import { DynamicValueInteger, DynamicValueString } from '../../../../client/step-client-module';
import { DynamicValueBaseComponent } from '../dynamic-value-base/dynamic-value-base.component';
import { DYNAMIC_EXPRESSION_TOGGLE_TOOLTIP } from '../../../basics/step-basics.module';
import { InputDropdownTriggerDirective } from '../../../basics/directives/input-dropdown-trigger.directive';
import { NUMBER_CHARS_POSITIVE_ONLY, NUMBER_CHARS_WITH_NEGATIVE } from '../../shared/constants';
import { PLAIN_VALUE_HELP } from '../../shared/dynamic-forms-help.token';
import { completeInterpolation, getInterpolationRange } from '../../shared/interpolation-completion';
import {
  INTERPOLATION_SUGGESTION_CONTEXT,
  InterpolationSuggestion,
  InterpolationSuggestionLookup,
  InterpolationSuggestionRequest,
} from '../../shared/interpolation-suggestions';
import { AceMode, RichEditorDialogService } from '../../../rich-editor';

const NO_SUGGESTIONS: readonly InterpolationSuggestion[] = [];

@Component({
  selector: 'step-dynamic-textfield',
  templateUrl: './dynamic-textfield.component.html',
  styleUrl: './dynamic-textfield.component.scss',
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class DynamicTextfieldComponent
  extends DynamicValueBaseComponent<DynamicValueString | DynamicValueInteger>
  implements OnChanges
{
  private _richEditorDialogs = inject(RichEditorDialogService);
  private readonly _injector = inject(Injector);
  private readonly _lookup = inject(InterpolationSuggestionLookup, { optional: true });
  private readonly _suggestionContext = inject(INTERPOLATION_SUGGESTION_CONTEXT, { optional: true });

  @Input() isNumber = false;
  @Input() isNegativeNumberAllowed = false;
  @Input() isPassword = false;
  @Input() predefinedRichEditorMode?: AceMode;
  @Input() allowedRichEditorModes?: AceMode[];

  protected readonly _plainValueHelp = inject(PLAIN_VALUE_HELP);
  protected readonly _toggleTooltip = inject(DYNAMIC_EXPRESSION_TOGGLE_TOOLTIP);
  protected allowedChars = NUMBER_CHARS_POSITIVE_ONLY;

  private readonly plainInput = viewChild<ElementRef<HTMLInputElement>>('plainInput');
  private readonly plainDropdownTrigger = viewChild('plainInput', { read: InputDropdownTriggerDirective });
  private readonly suggestionQuery = signal('');
  private pendingCaretRestore?: AfterRenderRef;

  private readonly suggestionRequest = computed(
    (): InterpolationSuggestionRequest | undefined => {
      const trigger = this.plainDropdownTrigger();
      const isOpen = trigger?.isOpen();
      const context = this._suggestionContext?.();
      const field = this._ngControl.name;
      if (!this._lookup || !isOpen || !context || typeof field !== 'string' || !field.trim()) {
        return undefined;
      }
      return { ...context, field };
    },
    {
      equal: (a, b) => a?.planId === b?.planId && a?.nodeId === b?.nodeId && a?.field === b?.field,
    },
  );

  private readonly suggestionResult = toSignal(
    toObservable(this.suggestionRequest).pipe(
      switchMap((request) => {
        const lookup = this._lookup;
        if (!lookup || !request) {
          return of(undefined);
        }
        this.updateSuggestionQuery();
        return defer(() => lookup.lookup(request)).pipe(
          map((items) => ({ request, items })),
          catchError(() => of(undefined)),
          startWith(undefined),
        );
      }),
    ),
  );

  protected readonly interpolationSuggestions = computed(() => {
    const request = this.suggestionRequest();
    const result = this.suggestionResult();
    const query = this.suggestionQuery();
    if (!result || result.request !== request) {
      return NO_SUGGESTIONS;
    }
    return result.items.filter((item) => item.expression.toLowerCase().startsWith(query));
  });

  protected readonly activeSuggestionIndex = linkedSignal({
    source: this.interpolationSuggestions,
    computation: (): number => -1,
  });

  constructor(_ngControl: NgControl) {
    super(_ngControl);
  }

  protected updateSuggestionQuery(): void {
    if (!this.suggestionRequest()) {
      return;
    }
    const input = this.plainInput()?.nativeElement;
    if (input) {
      const start = input.selectionStart ?? input.value.length;
      const end = input.selectionEnd ?? start;
      const { prefix } = getInterpolationRange(input.value, start, end);
      this.suggestionQuery.set(prefix.toLowerCase());
    }
  }

  protected handleSuggestionKeys(event: KeyboardEvent, listId: string): void {
    const suggestions = this.interpolationSuggestions();
    if (!suggestions.length || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    const activeIndex = this.activeSuggestionIndex();
    if (event.key === 'Enter' && suggestions[activeIndex]) {
      event.preventDefault();
      event.stopPropagation();
      this.selectSuggestion(suggestions[activeIndex]);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      event.stopPropagation();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      const currentIndex = activeIndex < 0 && step < 0 ? 0 : activeIndex;
      const nextIndex = (currentIndex + step + suggestions.length) % suggestions.length;
      this.activeSuggestionIndex.set(nextIndex);
      const document = this.plainInput()?.nativeElement.ownerDocument;
      document?.getElementById(`${listId}-${nextIndex}`)?.scrollIntoView({ block: 'nearest' });
    }
  }

  protected selectSuggestion(suggestion: InterpolationSuggestion): void {
    const input = this.plainInput()?.nativeElement;
    const trigger = this.plainDropdownTrigger();
    if (
      !input ||
      input.disabled ||
      input.readOnly ||
      !trigger?.isOpen() ||
      !this.interpolationSuggestions().includes(suggestion)
    ) {
      return;
    }

    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? start;
    const completion = completeInterpolation(input.value, start, end, suggestion.expression);
    this.pendingCaretRestore?.destroy();
    input.value = completion.value;
    this.onValueChange(completion.value);
    input.setSelectionRange(completion.caret, completion.caret);
    this.updateSuggestionQuery();
    this.activeSuggestionIndex.set(-1);

    this.pendingCaretRestore = afterNextRender(
      () => {
        this.pendingCaretRestore = undefined;
        if (
          input.ownerDocument.activeElement === input &&
          input.value === completion.value &&
          input.selectionStart === completion.value.length &&
          input.selectionEnd === completion.value.length
        ) {
          input.setSelectionRange(completion.caret, completion.caret);
          this.updateSuggestionQuery();
        }
      },
      { injector: this._injector },
    );
  }

  protected override defaultConstantValue(): string | number {
    return '';
  }
  protected override convertValueToExpression(value?: string | number): string {
    if (value) {
      return value.toString();
    }
    return '';
  }
  protected override convertExpressionToValue(expression: string): string | number {
    return this.parseValue(expression);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cIsNegativeNumberAllowed = changes['isNegativeNumberAllowed'];
    if (
      cIsNegativeNumberAllowed?.previousValue !== cIsNegativeNumberAllowed?.currentValue ||
      cIsNegativeNumberAllowed?.firstChange
    ) {
      this.allowedChars = cIsNegativeNumberAllowed?.currentValue
        ? NUMBER_CHARS_WITH_NEGATIVE
        : NUMBER_CHARS_POSITIVE_ONLY;
    }
  }

  editConstantValue(): void {
    this._richEditorDialogs
      .editText(this.value.toString(), {
        predefinedMode: this.predefinedRichEditorMode,
        allowedModes: this.allowedRichEditorModes,
        help: !this.isNumber && !this.isPassword ? this._plainValueHelp : undefined,
      })
      .subscribe((value) => {
        this.value = this.parseValue(value);
        this.emitChanges();
      });
  }

  private parseValue(value: string): string | number {
    if (this.isNumber) {
      let numValue = parseFloat(value);
      numValue = isNaN(numValue) ? 0 : numValue;
      return numValue;
    } else {
      return value;
    }
  }
}
