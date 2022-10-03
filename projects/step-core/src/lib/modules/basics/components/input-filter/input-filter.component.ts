import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { debounceTime, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'step-input-filter',
  templateUrl: './input-filter.component.html',
  styleUrls: ['./input-filter.component.scss'],
})
export class InputFilterComponent implements OnInit, OnDestroy {
  private terminator$ = new Subject<unknown>();

  readonly searchControl = this.formBuilder.control('');

  @Output() searchChange = new EventEmitter<string>();

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(200), takeUntil(this.terminator$))
      .subscribe((searchValue) => this.searchChange.emit(searchValue));
  }

  ngOnDestroy(): void {
    this.terminator$.next({});
    this.terminator$.complete();
  }
}
