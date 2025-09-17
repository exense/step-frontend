import { ChangeDetectionStrategy, Component, viewChildren } from '@angular/core';
import { MatColumnDef } from '@angular/material/table';

@Component({
  selector: 'step-columns-placeholders',
  templateUrl: './columns-placeholders.component.html',
  styleUrl: './columns-placeholders.component.scss',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnsPlaceholdersComponent {
  readonly colDef = viewChildren(MatColumnDef);
}
