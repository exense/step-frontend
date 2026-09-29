import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { DragDropContainerComponent, DropInfo } from '../drag-drop';
import { TreeComponent } from './components/tree/tree.component';
import { TreeNodeDraggableComponent } from './components/tree-node-draggable/tree-node-draggable.component';
import { TreeNodeTemplateDirective } from './directives/tree-node-template.directive';
import { TreeStateService } from './services/tree-state.service';
import { TreeNodeUtilsService } from './services/tree-node-utils.service';
import { TreeNode } from './types/tree-node';

@Component({
  selector: 'step-tree-test',
  imports: [TreeComponent, TreeNodeDraggableComponent, TreeNodeTemplateDirective, DragDropContainerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TreeStateService,
    { provide: TreeNodeUtilsService, useValue: { convertItem: (node: TreeNode): TreeNode => node } },
  ],
  template: `
    <step-drag-drop-container>
      <step-tree>
        <ng-template stepTreeNodeTemplate let-node>
          <step-tree-node-draggable
            [node]="node"
            [dragDisabled]="disabled"
            [dropDisabled]="disabled"
            (dropNode)="drops.push($event)"
          />
        </ng-template>
      </step-tree>
    </step-drag-drop-container>
  `,
})
/* eslint-disable step-lint/component-public-fields -- Test hosts expose their scenario inputs and results to assertions. */
class TreeTestComponent {
  readonly _state = inject<TreeStateService<TreeNode, TreeNode>>(TreeStateService);
  readonly drops: DropInfo[] = [];
  disabled = false;
}
/* eslint-enable step-lint/component-public-fields */

const node = (id: string, children: TreeNode[] = []): TreeNode => ({
  id,
  name: id,
  icon: 'folder',
  expandable: !!children.length,
  isSkipped: false,
  children,
});

const dragEvent = (type: string): Event => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'dataTransfer', { value: { setDragImage: jest.fn() } });
  return event;
};

describe('Tree interaction', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideNoopAnimations()] }));

  it('expands and selects nodes, delivers one drop with source and destination, then clears drag state', () => {
    const fixture = TestBed.createComponent(TreeTestComponent);
    const host = fixture.componentInstance;
    host._state.init(node('root', [node('alpha'), node('beta')]));
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const content = (id: string): HTMLElement => element.querySelector(`[data-tree-node-id="${id}"] .node-content`)!;
    const toggle = element.querySelector<HTMLButtonElement>('[data-tree-node-id="root"] button')!;
    expect(content('alpha').textContent).toContain('alpha');
    toggle.click();
    fixture.detectChanges();
    expect(content('alpha')).toBeNull();
    toggle.click();
    fixture.detectChanges();

    const source = content('alpha');
    const target = content('beta');
    source.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    fixture.detectChanges();
    expect(host._state.selectedNodeIds()).toEqual(['alpha']);
    expect(source.parentElement!.classList.contains('tree-node-selected')).toBe(true);
    source.dispatchEvent(dragEvent('dragstart'));
    fixture.detectChanges();
    expect(element.querySelector('step-drag-drop-container')!.classList.contains('drag-in-progress')).toBe(true);
    const over = dragEvent('dragover');
    target.dispatchEvent(over);
    expect(over.defaultPrevented).toBe(true);
    target.dispatchEvent(dragEvent('drop'));
    source.dispatchEvent(dragEvent('dragend'));
    fixture.detectChanges();
    expect(host.drops).toEqual([{ draggedElement: 'alpha', droppedArea: 'beta', additionalInfo: undefined }]);
    expect(element.querySelector('step-drag-drop-container')!.classList.contains('drag-in-progress')).toBe(false);
    expect(element.querySelector('.is-drag-in-progress')).toBeNull();
    fixture.destroy();
    target.dispatchEvent(dragEvent('drop'));
    expect(host.drops).toHaveLength(1);
  });

  it('keeps disabled nodes from starting or accepting a drag', () => {
    const fixture = TestBed.createComponent(TreeTestComponent);
    const host = fixture.componentInstance;
    host.disabled = true;
    host._state.init(node('root', [node('alpha')]));
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const source = element.querySelector<HTMLElement>('[data-tree-node-id="alpha"] .node-content')!;
    expect(source.draggable).toBe(false);
    source.dispatchEvent(dragEvent('dragstart'));
    source.dispatchEvent(dragEvent('drop'));
    fixture.detectChanges();
    expect(host.drops).toEqual([]);
    expect(element.querySelector('.drag-in-progress')).toBeNull();
  });
});
