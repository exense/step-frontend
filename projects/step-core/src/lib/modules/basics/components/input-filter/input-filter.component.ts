import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { debounceTime, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'step-input-filter',
  templateUrl: './input-filter.component.html',
  styleUrls: ['./input-filter.component.scss'],
})
export class InputFilterComponent implements OnInit, OnDestroy {
  private terminator$ = new Subject<unknown>();

  readonly searchControl = this.createControl();

  @Output() searchChange = new EventEmitter<string>();

  constructor(protected formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(debounceTime(200), takeUntil(this.terminator$)).subscribe((searchValue) => {
      if (this.searchControl.invalid) {
        return;
      }
      this.searchChange.emit(searchValue);
    });
  }

  ngOnDestroy(): void {
    this.terminator$.next({});
    this.terminator$.complete();
  }

  protected createControl(): FormControl {
    return this.formBuilder.control('');
  }
}
