import { KeyValue } from '@angular/common';
import { Component, inject, model, signal } from '@angular/core';
import { ArrayItemLabelValueDefaultExtractorService, StepBasicsModule } from '@exense/step-core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatAutocompleteHarness } from '@angular/material/autocomplete/testing';

const ITEMS: KeyValue<string, string>[] = [
  { key: 'item_1', value: 'Item 1 aaa' },
  { key: 'item_2', value: 'Item 2 bbb' },
  { key: 'item_3', value: 'Item 3 ccc' },
  { key: 'item_4', value: 'Item 4 aabb' },
  { key: 'item_5', value: 'Item 5 aacc' },
  { key: 'item_6', value: 'Item 6 bbaa' },
  { key: 'item_7', value: 'Item 7 bbcc' },
  { key: 'item_8', value: 'Item 8 ccaa' },
  { key: 'item_9', value: 'Item 9 ccbb' },
  { key: 'item_10', value: 'Item 10 ccc' },
];

@Component({
  selector: 'step-test-autocomplete-input',
  imports: [StepBasicsModule],
  template: `<step-autocomplete-input
    [(ngModel)]="data"
    [disabled]="isDisabled()"
    [valueLabelExtractor]="_extractor"
    [possibleItems]="ITEMS"
  />`,
})
class AutocompleteInputTestComponent {
  protected readonly ITEMS = ITEMS;
  protected readonly _extractor = inject(ArrayItemLabelValueDefaultExtractorService);
  readonly data = model('');
  readonly isDisabled = signal(false);
}

const getOptionsLabels = async (autocomplete: MatAutocompleteHarness): Promise<string[]> => {
  const options = await autocomplete.getOptions();
  return Promise.all(options.map((option) => option.getText()));
};

describe('AutocompleteInputComponent', () => {
  let fixture: ComponentFixture<AutocompleteInputTestComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutocompleteInputTestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AutocompleteInputTestComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('Render options', async () => {
    const autoComplete = await loader.getHarness(MatAutocompleteHarness);
    await autoComplete.focus();

    let labels = await getOptionsLabels(autoComplete);
    expect(labels).toEqual(ITEMS.map((item) => item.value));

    await autoComplete.clear();
    await autoComplete.enterText('aa');
    labels = await getOptionsLabels(autoComplete);
    expect(labels).toEqual(ITEMS.map((item) => item.value).filter((item) => item.includes('aa')));

    await autoComplete.clear();
    await autoComplete.enterText('bb');
    labels = await getOptionsLabels(autoComplete);
    expect(labels).toEqual(ITEMS.map((item) => item.value).filter((item) => item.includes('bb')));

    await autoComplete.clear();
    await autoComplete.enterText('cc');
    labels = await getOptionsLabels(autoComplete);
    expect(labels).toEqual(ITEMS.map((item) => item.value).filter((item) => item.includes('cc')));
  });

  it('Value change', async () => {
    const autoComplete = await loader.getHarness(MatAutocompleteHarness);
    expect(fixture.componentInstance.data()).toBe('');

    await autoComplete.clear();
    await autoComplete.focus();
    let options = await autoComplete.getOptions();
    await options[0].click();
    await autoComplete.blur();
    expect(fixture.componentInstance.data()).toBe(ITEMS[0].value);

    await autoComplete.clear();
    await autoComplete.focus();
    options = await autoComplete.getOptions();
    await options[1].click();
    await autoComplete.blur();
    expect(fixture.componentInstance.data()).toBe(ITEMS[1].value);
  });

  it('Disabled', async () => {
    const autoComplete = await loader.getHarness(MatAutocompleteHarness);

    let isAutoCompleteDisabled = await autoComplete.isDisabled();
    expect(isAutoCompleteDisabled).toBeFalsy();

    fixture.componentInstance.isDisabled.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    isAutoCompleteDisabled = await autoComplete.isDisabled();
    expect(isAutoCompleteDisabled).toBeTruthy();
  });
});
