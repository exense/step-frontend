import { Component, signal } from '@angular/core';
import { v4 } from 'uuid';
import { StepCoreModule } from '@exense/step-core';

interface TestItem {
  id: string;
  title: string;
}

@Component({
  selector: 'step-sandbox',
  imports: [StepCoreModule],
  templateUrl: './sandbox.component.html',
  styleUrl: './sandbox.component.scss',
})
export class SandboxComponent {
  private viewCounter = 0;

  protected readonly items = signal([this.createItem()]);

  protected removeItem(id: string): void {
    this.items.update((value) => {
      const index = value.findIndex((item) => item.id === id);
      return value.splice(0, index);
    });
  }

  protected addItem(): void {
    this.items.update((value) => [...value, this.createItem()]);
  }

  private createItem(): TestItem {
    const num = ++this.viewCounter;
    const id = v4();
    return {
      id,
      title: `${num} View`,
    };
  }
}
