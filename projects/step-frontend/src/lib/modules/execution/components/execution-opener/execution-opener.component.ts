import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'step-execution-opener',
  templateUrl: './execution-opener.component.html',
  styleUrls: ['./execution-opener.component.scss'],
})
export class ExecutionOpenerComponent implements OnInit {
  private _activatedRoute = inject(ActivatedRoute);
  private _router = inject(Router);

  ngOnInit(): void {
    const id = this._activatedRoute.snapshot.params['id'];
    this._router.navigate(['.', id, 'steps'], { relativeTo: this._activatedRoute.parent, replaceUrl: true });
  }
}
