import { Component, Input } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, AuthService } from '@exense/step-core';

@Component({
  selector: 'step-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
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

  constructor(private _auth: AuthService) {}

  ngOnInit() {
    if (this._auth.getConf()?.demo) {
      this.credentials.password = 'init';
      this.credentials.username = 'admin';
    }
  }

  login() {
    this._auth.login(this.credentials).then(
      function (user) {},
      (e) => (this.error = e.error)
    );
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepLogin', downgradeComponent({ component: LoginComponent }));
