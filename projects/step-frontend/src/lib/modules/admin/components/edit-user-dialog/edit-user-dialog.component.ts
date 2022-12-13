import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdminService, AuthService, User } from '@exense/step-core';
import { EditUserDialogData } from '../../types/edit-user-dialog-data.interface';

@Component({
  selector: 'og-edit-user-dialog',
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.scss'],
})
export class EditUserDialogComponent implements OnInit {
  readonly formGroup = this._formBuilder.nonNullable.group({
    username: ['', [Validators.required]],
    role: ['', [Validators.required]],
  });
  readonly isNew = !this._data;

  roles: string[] = [];

  constructor(
    private _matDialogRef: MatDialogRef<EditUserDialogComponent>,
    private _formBuilder: FormBuilder,
    private _authService: AuthService,
    private _adminService: AdminService,
    @Inject(MAT_DIALOG_DATA) public _data: EditUserDialogData
  ) {}

  ngOnInit(): void {
    this.initRoles();
    this.initFormGroup();
  }

  save(): void {
    const { username, role } = this.formGroup.value;

    const user: Partial<User> = {
      ...(this.isNew ? {} : this._data.user),
      username,
      role,
    };

    this._adminService.saveUser(user).subscribe({
      next: () => {
        this._matDialogRef.close(user);
      },
      error: () => {
        this._matDialogRef.close();
      },
    });
  }

  private initRoles(): void {
    const conf = this._authService.getConf();

    if (!conf) {
      return;
    }

    this.roles = conf.roles || [];
  }

  private initFormGroup(): void {
    if (this.isNew) {
      this.formGroup.patchValue({
        role: this.roles[0],
      });
    } else {
      this.formGroup.setValue({
        username: this._data.user.username || '',
        role: this._data.user.role || '',
      });
    }

    if (!this._authService.getConf()?.roleManagement) {
      this.formGroup.controls.role.disable();
    }
  }
}
