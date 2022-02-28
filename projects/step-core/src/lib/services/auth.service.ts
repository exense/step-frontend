import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import { ConfigDto, CredentialsDto, SessionDto } from '../domain';
import { firstValueFrom, Observable } from 'rxjs';
import { AJS_LOCATION, AJS_PREFERENCES, AJS_ROOT_SCOPE, AJS_UIB_MODAL } from '../shared/angularjs-providers';
import { AJS_MODULE } from '../shared/constants';
import { a1Promise2Promise } from '../shared/utils';

export interface AuthContext {
  userID: string;
  rights: string[];
  role: string;
  otp: boolean;
  session: any;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private _http: HttpClient,
    @Inject(AJS_ROOT_SCOPE) private _$rootScope: any,
    @Inject(AJS_LOCATION) private _$location: any,
    @Inject(DOCUMENT) private _document: Document,
    @Inject(AJS_PREFERENCES) private _preferences: any,
    @Inject(AJS_UIB_MODAL) private _$uibModal: any
  ) {}

  private _serviceContext: { conf?: ConfigDto } = {};

  private setContext(session: SessionDto): void {
    const context: AuthContext = {
      userID: session.username,
      rights: session.role.rights,
      role: session.role.attributes['name'],
      otp: session.otp,
      session: {},
    };
    this._$rootScope.context = context;
    this._preferences.load();
  }

  getContext(): AuthContext {
    return this._$rootScope.context as AuthContext;
  }

  async init(): Promise<unknown> {
    this._serviceContext.conf = await firstValueFrom(this._http.get('rest/access/conf') as Observable<ConfigDto>);
    this._document.title = this._serviceContext.conf.title;
    return undefined;
  }

  async getSession(): Promise<SessionDto | unknown> {
    try {
      const session = await firstValueFrom(this._http.get('rest/access/session') as Observable<SessionDto>);
      if (session.otp) {
        await this.showPasswordChangeDialog(true);
        session.otp = false;
        this.setContext(session);
        return session;
      } else {
        this.setContext(session);
        return session;
      }
    } catch (err) {
      return err;
    }
  }

  async login(credentials: CredentialsDto): Promise<unknown> {
    (await firstValueFrom(this._http.post('rest/access/login', credentials))) as Observable<{ token: string }>;
    await this.getSession();
    const context = this.getContext();
    if (context && !context.otp) {
      this._$rootScope.broadcast('step.login.succeeded');
      if (this._$location.path().indexOf('login') !== -1) {
        this.gotoDefaultPage();
      }
    }
    return undefined;
  }

  async logout(): Promise<unknown> {
    await firstValueFrom(this._http.post('rest/access/logout', {}));
    this._$rootScope.context = { userID: 'anonymous' };
    this.gotoDefaultPage();
    return undefined;
  }

  goToLoginPage(): any {
    return this._$location.path('/root/login');
  }

  gotoDefaultPage(): void {
    console.log('gotoDefaultPage', this._serviceContext?.conf?.defaultUrl);
    if (this._serviceContext.conf && this._serviceContext.conf.defaultUrl) {
      this._$location.path(this._serviceContext.conf.defaultUrl);
    } else {
      this._$location.path('/root/plans/list');
    }
  }

  isAuthenticated(): boolean {
    return this._$rootScope.context.userID && this._$rootScope.context.userID !== 'anonymous';
  }

  isExtLoginAuth(): boolean {
    return !!this._serviceContext?.conf?.noLoginMask;
  }

  hasRight(right: string): boolean {
    // don't allow write- or delete- actions in the [All] tenant except for user and project
    if (
      this._$rootScope.tenant &&
      (this._$rootScope.tenant.name === '[All]' || this._$rootScope.tenant.name === '[None]') &&
      !(right.startsWith('user') || right.startsWith('project')) &&
      (right.endsWith('-write') || right.endsWith('-delete') || right.endsWith('-execute'))
    ) {
      return false;
    }

    return this._$rootScope.context && this._$rootScope.context.rights
      ? this._$rootScope.context.rights.indexOf(right) !== -1
      : false;
  }

  getConf(): any {
    return this._serviceContext.conf;
  }

  debug(): boolean {
    const conf = this._serviceContext.conf;
    return conf ? conf.debug : false;
  }

  showPasswordChangeDialog(otp: boolean): Promise<unknown> {
    const modalInstance = this._$uibModal.open({
      backdrop: 'static',
      animation: false,
      templateUrl: 'partials/changePasswordForm.html',
      controller: 'ChangePasswordModalCtrl',
      resolve: {
        otp: function () {
          return otp;
        },
      },
    });
    return a1Promise2Promise(modalInstance.result);
  }
}

getAngularJSGlobal().module(AJS_MODULE).service('AuthService2', downgradeInjectable(AuthService));
