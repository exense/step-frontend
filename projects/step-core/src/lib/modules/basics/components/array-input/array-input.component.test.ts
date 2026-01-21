import { KeyValue } from '@angular/common';
import { Component, inject, model, signal } from '@angular/core';
import { ArrayItemLabelValueDefaultExtractorService, StepBasicsModule } from '@exense/step-core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatAutocompleteHarness } from '@angular/material/autocomplete/testing';
import { MatChipGridHarness, MatChipRemoveHarness } from '@angular/material/chips/testing';

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
  selector: 'step-array-input-test',
  imports: [StepBasicsModule],
  template: `
    <step-array-input
      [(ngModel)]="data"
      [disabled]="isDisabled()"
      [possibleItems]="ITEMS"
      [valueLabelExtractor]="_extractor"
    />
  `,
})
class ArrayInputTestComponent {
  protected readonly _extractor = inject(ArrayItemLabelValueDefaultExtractorService);
  readonly ITEMS = ITEMS;
  readonly data = model<string[] | undefined>([]);
  readonly isDisabled = signal(false);
}

const getOptionsLabels = async (autocomplete: MatAutocompleteHarness): Promise<string[]> => {
  const options = await autocomplete.getOptions();
  return Promise.all(options.map((option) => option.getText()));
};

const getChipLabels = async (chipGrid: MatChipGridHarness): Promise<string[]> => {
  const chipItems = await chipGrid.getRows();
  return Promise.all(chipItems.map((item) => item.getText()));
};

describe('ArrayInputComponent', () => {
  let fixture: ComponentFixture<ArrayInputTestComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArrayInputTestComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ArrayInputTestComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('Render options', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
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

  it('Selection changes', async () => {
    const autoComplete = await loader.getHarness(MatAutocompleteHarness);
    const chipGrid = await loader.getHarness(MatChipGridHarness);
    let chipItems = await chipGrid.getRows();

    expect(chipItems.length).toBe(0);
    expect(fixture.componentInstance.data()).toEqual([]);

    let selection = ITEMS.filter((item, i) => (i + 1) % 2 === 0);
    for (const item of selection) {
      await autoComplete.focus();
      await autoComplete.selectOption({ text: item.value });
      await autoComplete.blur();
    }
    expect(fixture.componentInstance.data()).toEqual(selection.map((item) => item.key));
    let chipTexts = await getChipLabels(chipGrid);
    expect(chipTexts).toEqual(selection.map((item) => item.value));

    chipItems = await chipGrid.getRows();
    const lastSelectedItem = chipItems[chipItems.length - 1];
    const lastRemove = await lastSelectedItem.getRemoveButton();
    await lastRemove.click();

    selection.splice(selection.length - 1, 1);
    expect(fixture.componentInstance.data()).toEqual(selection.map((item) => item.key));
    chipTexts = await getChipLabels(chipGrid);
    expect(chipTexts).toEqual(selection.map((item) => item.value));

    selection = ITEMS.slice(0, 3);
    fixture.componentInstance.data.set(selection.map((item) => item.key));
    fixture.detectChanges();
    await fixture.whenStable();

    chipTexts = await getChipLabels(chipGrid);
    expect(chipTexts).toEqual(selection.map((item) => item.value));

    const notSelected = ITEMS.slice(3);
    await autoComplete.focus();
    const optionLabels = await getOptionsLabels(autoComplete);
    expect(optionLabels).toEqual(notSelected.map((item) => item.value));
  });

  it('Disable control', async () => {
    const autoComplete = await loader.getHarness(MatAutocompleteHarness);
    const chipGrid = await loader.getHarness(MatChipGridHarness);

    fixture.componentInstance.data.set([ITEMS[0].key]);
    fixture.detectChanges();
    await fixture.whenStable();

    let isAutoCompleteDisabled = await autoComplete.isDisabled();
    expect(isAutoCompleteDisabled).toBeFalsy();

    let chipItems = await chipGrid.getRows();
    let hasRemoveButton = await chipItems[0].hasHarness(MatChipRemoveHarness);
    expect(hasRemoveButton).toBeTruthy();

    fixture.componentInstance.isDisabled.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    isAutoCompleteDisabled = await autoComplete.isDisabled();
    expect(isAutoCompleteDisabled).toBeTruthy();

    chipItems = await chipGrid.getRows();
    hasRemoveButton = await chipItems[0].hasHarness(MatChipRemoveHarness);
    expect(hasRemoveButton).toBeFalsy();
  });
});
