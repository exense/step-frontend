import { Component, Input } from '@angular/core';
import { EntityMenuComponent } from '../entity-menu/entity-menu.component';

@Component({
  selector: 'step-entity-menu-button',
  templateUrl: './entity-menu-button.component.html',
  styleUrls: ['./entity-menu-button.component.scss'],
  standalone: false,
})
export class EntityMenuButtonComponent {
  @Input() entityItem?: unknown;
  @Input() entityMenu?: EntityMenuComponent;
}
