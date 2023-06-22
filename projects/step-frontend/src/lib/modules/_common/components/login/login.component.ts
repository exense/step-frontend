import { Component, inject, Input, ViewEncapsulation } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, ApiError, AuthService } from '@exense/step-core';
import { HttpErrorInterceptor } from '../../interceptors/http-error.interceptor';

@Component({
  selector: 'step-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LoginComponent {
  credentials = {
    username: '',
    password: '',
  };
  error?: string;
  capsLock?: boolean;

  @Input() logo: string = 'images/logologin.png';

  readonly loginDescriptionText: string = '';
  readonly _auth = inject(AuthService);

  constructor() {}

  ngOnInit() {
    this._auth.checkOidc();
    if (this._auth.getConf()?.demo) {
      this.credentials.password = 'init';
      this.credentials.username = 'admin';
    }
  }

  login() {
    const { username, password } = this.credentials;
    this._auth
      .login(username, password)
      .pipe()
      .subscribe({
        error: (error: ApiError) => {
          this.error = HttpErrorInterceptor.handleError(error);
        },
      });
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepLogin', downgradeComponent({ component: LoginComponent }));
