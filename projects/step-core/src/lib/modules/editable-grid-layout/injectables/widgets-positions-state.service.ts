import { Injectable, signal, untracked } from '@angular/core';
import { WidgetPosition } from '../types/widget-position';
import { RowCorrection } from '../types/row-correction';
import { ColumnCorrection } from '../types/column-correction';

@Injectable()
export class WidgetsPositionsStateService {
  private readonly positionsStateInternal = signal<Record<string, WidgetPosition>>({});

  readonly positions = this.positionsStateInternal.asReadonly();

  updatePosition(position: WidgetPosition): void {
    this.positionsStateInternal.update((value) => ({
      ...value,
      [position.id]: position,
    }));
  }

  swapPositions(aElementId: string, bElementId: string): void {
    const positions = untracked(() => this.positions());
    const positionA = positions[aElementId];
    const positionB = positions[bElementId];
    if (!positionA || !positionB) {
      return;
    }
    const newPositionA = new WidgetPosition(aElementId, positionB);
    const newPositionB = new WidgetPosition(bElementId, positionA);
    this.positionsStateInternal.update((value) => ({
      ...value,
      [newPositionA.id]: newPositionA,
      [newPositionB.id]: newPositionB,
    }));
  }

  findAvailablePositionForElement(elementId: string, column: number, row: number): WidgetPosition {
    const positions = untracked(() => this.positions());
    const positionItems = Object.values(positions);

    const otherWidgetPosition = positionItems.find((pos) => {
      return column >= pos.leftEdge && column <= pos.rightEdge && row >= pos.topEdge && row <= pos.bottomEdge;
    });

    if (!!otherWidgetPosition) {
      return otherWidgetPosition;
    }

    const currentElementPosition = positions[elementId];
    const possiblePosition = new WidgetPosition(elementId, {
      column,
      row,
      widthInCells: currentElementPosition?.widthInCells ?? 1,
      heightInCells: currentElementPosition?.heightInCells ?? 1,
    });

    const rowCorrections = this.overlapsInsideRow(possiblePosition);
    const columnCorrections = this.overlapsInsideColumn(possiblePosition);

    const fixedByRow = possiblePosition.clone();
    fixedByRow.applyRowCorrection(rowCorrections);

    const fixedByColumn = possiblePosition.clone();
    fixedByColumn.applyColumnCorrection(columnCorrections);

    const fixedByBoth = possiblePosition.clone();
    fixedByBoth.applyRowCorrection(rowCorrections);
    fixedByColumn.applyColumnCorrection(columnCorrections);

    const positionVariants = [fixedByRow, fixedByColumn, fixedByBoth]
      .map((pos) => ({
        pos,
        distance: pos.distance(possiblePosition),
      }))
      .sort((a, b) => a.distance - b.distance);

    return positionVariants[0].pos;
  }

  overlapsInsideRow(checkPosition: WidgetPosition): RowCorrection {
    const positions = Object.values(untracked(() => this.positions()));

    const lefts: number[] = [];
    const rights: number[] = [];

    positions.forEach((pos) => {
      if (
        pos.id === checkPosition.id ||
        checkPosition.topEdge > pos.bottomEdge ||
        pos.topEdge > checkPosition.bottomEdge ||
        checkPosition.leftEdge > pos.rightEdge ||
        pos.leftEdge > checkPosition.rightEdge
      ) {
        return;
      }

      if (checkPosition.leftEdge >= pos.leftEdge && checkPosition.rightEdge <= pos.rightEdge) {
        lefts.push(checkPosition.column);
        rights.push(checkPosition.widthInCells);
        return;
      }

      if (checkPosition.rightEdge >= pos.leftEdge) {
        rights.push(checkPosition.rightEdge - pos.leftEdge + 1);
        return;
      }

      if (checkPosition.leftEdge >= pos.leftEdge) {
        debugger;
        lefts.push(Math.abs(checkPosition.rightEdge - pos.leftEdge) + 1);
      }
    });

    const left = !lefts.length ? 0 : Math.max(...lefts);
    const right = !rights.length ? 0 : Math.max(...rights);

    return { left, right };
  }

  overlapsInsideColumn(checkPosition: WidgetPosition): ColumnCorrection {
    const positions = Object.values(untracked(() => this.positions()));

    const tops: number[] = [];
    const bottoms: number[] = [];

    positions.forEach((pos) => {
      if (
        pos.id === checkPosition.id ||
        checkPosition.leftEdge > pos.rightEdge ||
        pos.leftEdge > checkPosition.rightEdge ||
        checkPosition.topEdge > pos.bottomEdge ||
        pos.topEdge > checkPosition.bottomEdge
      ) {
        return;
      }

      if (checkPosition.topEdge >= pos.topEdge && checkPosition.bottomEdge <= pos.bottomEdge) {
        tops.push(checkPosition.row);
        bottoms.push(checkPosition.heightInCells);
        return;
      }

      if (checkPosition.bottomEdge >= pos.topEdge) {
        bottoms.push(checkPosition.bottomEdge - pos.topEdge + 1);
        return;
      }

      if (checkPosition.topEdge >= pos.topEdge) {
        tops.push(Math.abs(checkPosition.bottomEdge - pos.topEdge) + 1);
      }
    });

    const top = !tops.length ? 0 : Math.max(...tops);
    const bottom = !bottoms.length ? 0 : Math.max(...bottoms);
    return { top, bottom };
  }
}
