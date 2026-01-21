import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArrayItemLabelValueExtractor, StepBasicsModule } from '@exense/step-core';
import { Component, input, model } from '@angular/core';
import { KeyValue } from '@angular/common';
import { HarnessLoader } from '@angular/cdk/testing';
import { By } from '@angular/platform-browser';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSelectHarness } from '@angular/material/select/testing';

@Component({ template: '' })
abstract class BaseTestSelectComponent {
  readonly selectModel = model<number | string | undefined>(undefined);
  readonly useSearch = input(false);
  readonly multiple = input(false);
  readonly items = input<any[] | undefined>(undefined);
  readonly emptyPlaceholder = input<string>('');
  readonly extractor = input<ArrayItemLabelValueExtractor<any, any> | undefined>(undefined);
  readonly useClear = input(false);
  readonly clearLabel = input('clear');
  readonly clearValue = input<null | undefined>(undefined);
}

@Component({
  selector: 'step-test-select',
  imports: [StepBasicsModule],
  template: `
    <step-select
      [(ngModel)]="selectModel"
      [useSearch]="useSearch()"
      [multiple]="multiple()"
      [items]="items()"
      [emptyPlaceholder]="emptyPlaceholder()"
      [extractor]="extractor()"
      [useClear]="useClear()"
      [clearLabel]="clearLabel()"
      [clearValue]="clearValue()"
    />
  `,
})
class TestSelectComponent extends BaseTestSelectComponent {}

@Component({
  selector: 'step-test-select-with-extra-options',
  imports: [StepBasicsModule],
  template: `
    <step-select
      [(ngModel)]="selectModel"
      [useSearch]="useSearch()"
      [multiple]="multiple()"
      [items]="items()"
      [emptyPlaceholder]="emptyPlaceholder()"
      [extractor]="extractor()"
      [useClear]="useClear()"
      [clearLabel]="clearLabel()"
      [clearValue]="clearValue()"
    >
      <step-select-extra-options>
        <mat-option value="1">ONE</mat-option>
        <mat-option value="2">TWO</mat-option>
        <mat-option value="3">THREE</mat-option>
      </step-select-extra-options>
    </step-select>
  `,
})
class TestSelectWithExtraOptionsComponent extends BaseTestSelectComponent {}

const updateSearchValue = (fixture: ComponentFixture<BaseTestSelectComponent>, searchValue: string) => {
  const seInput = fixture.debugElement.parent!.query(By.css('.mat-select-search-inner-row > .mat-select-search-input'));
  seInput.nativeElement.value = searchValue;
  seInput.triggerEventHandler('input', { target: seInput.nativeElement });
};

const getOptionTexts = async (select: MatSelectHarness, optionsSelector?: { selector: string }) => {
  const options = await select.getOptions(optionsSelector);
  const result = [] as string[];
  for (const opt of options) {
    const text = await opt.getText();
    result.push(text);
  }
  return result;
};

describe('SelectComponent', () => {
  describe('Common Functionality', () => {
    let fixture: ComponentFixture<TestSelectComponent>;
    let loader: HarnessLoader;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestSelectComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(TestSelectComponent);
      fixture.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixture);
      await fixture.whenStable();
    });

    it('Selection', async () => {
      const select = await loader.getHarness(MatSelectHarness);
      await select.open();
      let options = await select.getOptions();

      expect(options.length).toBe(0);
      await select.close();

      fixture.componentRef.setInput('items', [
        { key: 1, value: 'One' },
        { key: 2, value: 'Two' },
        { key: 3, value: 'Three' },
      ] as KeyValue<number, string>[]);

      fixture.detectChanges();
      await fixture.whenStable();

      await select.open();

      options = await select.getOptions();

      expect(options.length).toBe(3);

      expect(fixture.componentInstance.selectModel()).toBe(undefined);

      await options[0].click();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(fixture.componentInstance.selectModel()).toBe(1);

      await options[1].click();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(fixture.componentInstance.selectModel()).toBe(2);

      await options[2].click();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(fixture.componentInstance.selectModel()).toBe(3);
    });

    it('Clear', async () => {
      const SELECTOR_CLEAR_OPTION = { selector: '.step-select-clear-value' };
      const SELECTOR_ITEM_OPTION = { selector: ':not(.step-select-clear-value)' };

      const select = await loader.getHarness(MatSelectHarness);
      await select.open();
      let clearOptions = await select.getOptions(SELECTOR_CLEAR_OPTION);
      let itemOptions = await select.getOptions(SELECTOR_ITEM_OPTION);

      expect(clearOptions.length).toBe(0);
      expect(itemOptions.length).toBe(0);

      await select.close();
      fixture.componentRef.setInput('useClear', true);
      fixture.detectChanges();
      await fixture.whenStable();

      await select.open();
      clearOptions = await select.getOptions(SELECTOR_CLEAR_OPTION);
      itemOptions = await select.getOptions(SELECTOR_ITEM_OPTION);

      expect(clearOptions.length).toBe(1);
      expect(itemOptions.length).toBe(0);
      await select.close();

      fixture.componentRef.setInput('items', [
        { key: 1, value: 'One' },
        { key: 2, value: 'Two' },
        { key: 3, value: 'Three' },
      ] as KeyValue<number, string>[]);

      fixture.detectChanges();
      await fixture.whenStable();

      await select.open();
      clearOptions = await select.getOptions(SELECTOR_CLEAR_OPTION);
      itemOptions = await select.getOptions(SELECTOR_ITEM_OPTION);

      expect(clearOptions.length).toBe(1);
      expect(itemOptions.length).toBe(3);

      await itemOptions[0].click();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(fixture.componentInstance.selectModel()).toBe(1);

      await select.clickOptions(SELECTOR_CLEAR_OPTION);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.componentInstance.selectModel()).toBe(undefined);

      await itemOptions[1].click();
      fixture.componentRef.setInput('clearValue', null);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(fixture.componentInstance.selectModel()).toBe(2);

      await select.clickOptions(SELECTOR_CLEAR_OPTION);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.componentInstance.selectModel()).toBe(null);

      await select.open();
      let clearOptionText = await select.getOptions(SELECTOR_CLEAR_OPTION).then((options) => options[0].getText());
      expect(clearOptionText).toBe('clear');

      fixture.componentRef.setInput('clearLabel', 'Erase value');
      fixture.detectChanges();
      await fixture.whenStable();
      await select.open();
      clearOptionText = await select.getOptions(SELECTOR_CLEAR_OPTION).then((options) => options[0].getText());
      expect(clearOptionText).toBe('Erase value');
    });

    it('Search', async () => {
      const SELECTOR_SEARCH_OPTION = { selector: '.contains-mat-select-search' };
      const SELECTOR_ITEM_OPTION = { selector: ':not(.contains-mat-select-search)' };

      const select = await loader.getHarness(MatSelectHarness);
      await select.open();

      let searchOptions = await select.getOptions(SELECTOR_SEARCH_OPTION);
      let itemOptions = await select.getOptions(SELECTOR_ITEM_OPTION);
      expect(searchOptions.length).toBe(0);
      expect(itemOptions.length).toBe(0);
      await select.close();

      fixture.componentRef.setInput('useSearch', true);
      await select.open();

      searchOptions = await select.getOptions(SELECTOR_SEARCH_OPTION);
      itemOptions = await select.getOptions(SELECTOR_ITEM_OPTION);
      expect(searchOptions.length).toBe(1);
      expect(itemOptions.length).toBe(0);

      fixture.componentRef.setInput('items', [
        { key: 'aaa_aaa', value: 'AAA AAA' },
        { key: 'aaa_bbb', value: 'AAA BBB' },
        { key: 'bbb_ccc', value: 'BBB CCC' },
      ] as KeyValue<string, string>[]);

      await select.open();
      searchOptions = await select.getOptions(SELECTOR_SEARCH_OPTION);
      itemOptions = await select.getOptions(SELECTOR_ITEM_OPTION);
      expect(searchOptions.length).toBe(1);
      expect(itemOptions.length).toBe(3);

      let texts = await getOptionTexts(select, SELECTOR_ITEM_OPTION);
      expect(texts).toEqual(['AAA AAA', 'AAA BBB', 'BBB CCC']);

      updateSearchValue(fixture, 'aaa');
      fixture.detectChanges();
      await fixture.whenStable();

      texts = await getOptionTexts(select, SELECTOR_ITEM_OPTION);
      expect(texts).toEqual(['AAA AAA', 'AAA BBB']);

      updateSearchValue(fixture, 'bbb');
      fixture.detectChanges();
      await fixture.whenStable();
      texts = await getOptionTexts(select, SELECTOR_ITEM_OPTION);
      expect(texts).toEqual(['AAA BBB', 'BBB CCC']);

      updateSearchValue(fixture, '');
      fixture.detectChanges();
      await fixture.whenStable();
      texts = await getOptionTexts(select, SELECTOR_ITEM_OPTION);
      expect(texts).toEqual(['AAA AAA', 'AAA BBB', 'BBB CCC']);
    });
  });

  describe('Extra options', () => {
    let fixture: ComponentFixture<TestSelectWithExtraOptionsComponent>;
    let loader: HarnessLoader;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestSelectWithExtraOptionsComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(TestSelectWithExtraOptionsComponent);
      fixture.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixture);
      await fixture.whenStable();
    });

    it('Extra options', async () => {
      const select = await loader.getHarness(MatSelectHarness);
      await select.open();
      let optionsText = await getOptionTexts(select);
      expect(optionsText).toEqual(['ONE', 'TWO', 'THREE']);

      fixture.componentRef.setInput('items', [
        { key: 'aaa_aaa', value: 'AAA AAA' },
        { key: 'aaa_bbb', value: 'AAA BBB' },
        { key: 'bbb_ccc', value: 'BBB CCC' },
      ] as KeyValue<string, string>[]);

      await select.open();
      optionsText = await getOptionTexts(select);
      expect(optionsText).toEqual(['ONE', 'TWO', 'THREE', 'AAA AAA', 'AAA BBB', 'BBB CCC']);
    });
  });
});
