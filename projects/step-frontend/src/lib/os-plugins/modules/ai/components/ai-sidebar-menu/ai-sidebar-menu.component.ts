import { ChangeDetectionStrategy, Component, inject, signal, ViewEncapsulation } from '@angular/core';
import { CustomComponent, MenuEntry, NavigatorService, StepCoreModule } from '@exense/step-core';
import { Observable } from 'rxjs';
import { SidebarStateService } from '../../../../../modules/_common/injectables/sidebar-state.service';
import { AI_GENERATE_PATH } from '../../shared/ai.constants';

const AI_SIDEBAR_MENU_STATE_KEY = 'ai-generate-root';
const MIDDLE_BUTTON = 1;

interface AiSidebarMenuItem {
  readonly entry: MenuEntry;
  readonly isActive$: Observable<boolean>;
  readonly isEnabled: boolean;
}

const AI_SIDEBAR_PARENT: MenuEntry = {
  id: AI_GENERATE_PATH,
  title: 'AI Generate',
  icon: 'zap',
  isEnabledFunction: () => true,
};

const AI_SIDEBAR_CHILDREN: readonly MenuEntry[] = [
  {
    id: `${AI_GENERATE_PATH}/generate`,
    title: 'Generate Plan',
    icon: 'zap',
    isEnabledFunction: () => true,
  },
  {
    id: `${AI_GENERATE_PATH}/generations`,
    title: 'Generations',
    icon: 'sparkles',
    isEnabledFunction: () => true,
  },
];

@Component({
  selector: 'step-ai-sidebar-menu',
  imports: [StepCoreModule],
  templateUrl: './ai-sidebar-menu.component.html',
  styleUrl: './ai-sidebar-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class AiSidebarMenuComponent implements CustomComponent {
  private readonly _navigator = inject(NavigatorService);
  private readonly _sidebarState = inject(SidebarStateService);

  protected readonly isSidebarOpened$ = this._sidebarState.isOpened$;
  protected readonly isParentActive$ = this._navigator.isViewIdActive(AI_SIDEBAR_PARENT);
  protected readonly isExpanded = signal(this._sidebarState.openedMenuItems?.[AI_SIDEBAR_MENU_STATE_KEY] ?? true);
  protected readonly menuItems: readonly AiSidebarMenuItem[] = AI_SIDEBAR_CHILDREN.map((entry) => ({
    entry,
    isActive$: this._navigator.isViewIdActive(entry),
    isEnabled: entry.isEnabledFunction(),
  }));

  context?: unknown;

  protected toggleExpanded(): void {
    const isExpanded = !this.isExpanded();
    this.isExpanded.set(isExpanded);
    this._sidebarState.setMenuItemState(AI_SIDEBAR_MENU_STATE_KEY, isExpanded);
  }

  protected navigate(item: AiSidebarMenuItem, event: MouseEvent): void {
    if (event.type === 'auxclick' && event.button !== MIDDLE_BUTTON) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (!item.isEnabled) {
      return;
    }

    const isOpenInSeparateTab = event.ctrlKey || event.metaKey || event.button === MIDDLE_BUTTON;
    this._navigator.navigate(item.entry.id, isOpenInSeparateTab);
  }
}
