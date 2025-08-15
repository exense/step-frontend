import { ChangeDetectionStrategy, Component, computed, input, TemplateRef } from '@angular/core';
import { KeyValue } from '@angular/common';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { TableLocalDataSource, TableModule } from '../../../table/table.module';
import { AutoShrankItemValueComponent } from '../auto-shrank-item-value/auto-shrank-item-value.component';

@Component({
  selector: 'step-auto-shrank-all-items',
  imports: [StepBasicsModule, TableModule, AutoShrankItemValueComponent],
  templateUrl: './auto-shrank-all-items.component.html',
  styleUrl: './auto-shrank-all-items.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutoShrankAllItemsComponent {
  readonly items = input<KeyValue<string, string>[]>([]);
  readonly emptyValueTemplate = input<TemplateRef<unknown>>();
  readonly emptySearchPatterns = input('', {
    transform: (value?: string | string[]) => {
      const items: string[] = !value ? [] : !(value instanceof Array) ? [value] : value;
      return items.join(' ');
    },
  });

  private dataSourceConfig = TableLocalDataSource.configBuilder<KeyValue<string, string>>()
    .addSearchStringPredicate('key', (item) => item.key)
    .addCustomSearchPredicate('value', (item, searchValue) => {
      const value = (item.value || '').toLowerCase();
      const search = searchValue.toLowerCase();
      if (!value && this.emptySearchPatterns().includes(search)) {
        return true;
      }
      return value.includes(searchValue);
    })
    .build();

  protected readonly dataSource = computed(() => {
    const items = this.items();
    return new TableLocalDataSource(items, this.dataSourceConfig);
  });
}
