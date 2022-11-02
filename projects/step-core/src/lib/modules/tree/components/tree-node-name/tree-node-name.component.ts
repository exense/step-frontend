import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { ArtefactFlatNode } from '../../shared/artefact-flat-node';
import { TreeStateService } from '../../services/tree-state.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'step-tree-node-name',
  templateUrl: './tree-node-name.component.html',
  styleUrls: ['./tree-node-name.component.scss'],
})
export class TreeNodeNameComponent implements AfterViewInit, OnDestroy {
  private terminator$ = new Subject<unknown>();

  @Input() node?: ArtefactFlatNode;

  @ViewChild('inputElement', { static: true })
  inputElement!: ElementRef;

  isEditMode: boolean = false;

  constructor(private _treeState: TreeStateService) {}

  submitNameChange(): void {
    this._treeState.updateEditNodeName(this.inputElement.nativeElement.value);
  }

  ngAfterViewInit(): void {
    this._treeState.editNodeId$.pipe(takeUntil(this.terminator$)).subscribe((editNodeId) => {
      this.isEditMode = !!editNodeId && editNodeId === this.node?.id;
      if (this.isEditMode) {
        this.inputElement.nativeElement.value = this.node!.name;
        setTimeout(() => {
          this.inputElement.nativeElement.focus();
        }, 50);
      }
    });
  }

  ngOnDestroy(): void {
    this.terminator$.next({});
    this.terminator$.complete();
  }
}
