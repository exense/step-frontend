import { DOCUMENT } from '@angular/common';
import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { SessionDto } from '../../../domain';
import { BehaviorSubject, catchError, map, Observable, of, shareReplay, switchMap, tap } from 'rxjs';
import {
  ApplicationConfiguration,
  PrivateApplicationService,
  AppConfigContainerService,
} from '../../../client/step-client-module';
import { Router } from '@angular/router';
import { AdditionalRightRuleService } from './additional-right-rule.service';
import { GlobalReloadService, Reloadable, SESSION_STORAGE } from '../../basics/step-basics.module';
import { AuthContext } from '../types/auth-context.interface';
import { AccessPermissionCondition, AccessPermissionGroup, NavigatorService } from '../../routing';
import { CredentialsService } from './credentials.service';

const OIDC_ENDPOINT_PARAM = 'startOidcEndPoint';

const ANONYMOUS = 'anonymous';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy, Reloadable {
  private _router = inject(Router);
  private _document = inject(DOCUMENT);

  private _sessionStorage = inject(SESSION_STORAGE);
  private _additionalRightRules = inject(AdditionalRightRuleService);
  private _privateApplicationApi = inject(PrivateApplicationService);
  private _credentialsService = inject(CredentialsService);
  private _serviceContext = inject(AppConfigContainerService);
  private _navigator = inject(NavigatorService);
  private _globalReloadService = inject(GlobalReloadService);

  private triggerRightCheckInternal$ = new BehaviorSubject<unknown>(undefined);

  readonly triggerRightCheck$ = this.triggerRightCheckInternal$.asObservable();

  private contextInternal$ = new BehaviorSubject<AuthContext | undefined>(undefined);

  readonly context$ = this.contextInternal$.asObservable();

  readonly isAuthenticated$ = this.context$.pipe(map((context) => !!context?.userID && context?.userID !== ANONYMOUS));

  private isOidcInternal = signal(false);
  readonly isOidc = this.isOidcInternal.asReadonly();

  readonly initialize$ = this._privateApplicationApi.getApplicationConfiguration().pipe(
    tap((conf) => {
      this._serviceContext.setConfiguration(conf);
      if (conf.title) {
        this._document.title = conf.title;
      }
      const startOidcEndpoint = conf?.miscParams?.[OIDC_ENDPOINT_PARAM] || undefined;
      const isOidc = !!startOidcEndpoint && !!conf?.noLoginMask && !!conf.authentication;
      this.isOidcInternal.set(isOidc);
    }),
    switchMap(() => this.getSession()),
    map(() => this._serviceContext?.conf?.debug || false),
    shareReplay(1),
  );

  constructor() {
    this._globalReloadService.register(this);
  }

  private setContextFromSession(session: SessionDto): void {
    const context: AuthContext = {
      userID: session.username,
      rights: session.role.rights,
      role: session.role.attributes['name'],
      otp: session.otp,
      session: {},
    };
    this.setContext(context);
    this.triggerRightCheck();
  }

  private setContext(context: AuthContext) {
    this.contextInternal$.next(context);
  }

  private getContext(): AuthContext {
    return this.contextInternal$.value as AuthContext;
  }

  getUserID(): string {
    return this.getContext().userID;
  }

  updateContext(info: Partial<AuthContext>): void {
    const context = { ...this.getContext(), ...info };
    this.setContext(context);
  }

  login(username: string, password: string): Observable<unknown> {
    return this._credentialsService.login(username, password).pipe(
      switchMap(() => this.getSession()),
      tap(() => {
        const context = this.getContext();
        if (context && !context.otp) {
          if (this._router.url.indexOf('login') !== -1) {
            this._navigator.navigateAfterLogin();
          }
        }
      }),
    );
  }

  logout(): void {
    this._credentialsService.logout().subscribe(() => this.performPostLogoutActions());
  }

  performPostLogoutActions(): void {
    this._sessionStorage.clear();
    this.setContext({ userID: ANONYMOUS });
    this._navigator.navigateToRoot();
  }

  goToLoginPage(): void {
    this._navigator.navigate('login');
  }

  checkOidc(): void {
    if (this.isOidc()) {
      this.redirectToOidc();
      return;
    }
  }

  isAuthenticated(): boolean {
    const context = this.getContext();
    return !!context?.userID && context?.userID !== ANONYMOUS;
  }

  isExtLoginAuth(): boolean {
    return !!this._serviceContext?.conf?.noLoginMask;
  }

  hasRight$(right: string): Observable<boolean> {
    return this.triggerRightCheck$.pipe(map(() => this.hasRight(right)));
  }

  hasRight(right: string): boolean {
    const conf = this.getConf();
    if (!!conf && !conf.authentication) {
      return true;
    }

    const additionalRulesCheckResult = this._additionalRightRules.checkRight(right);
    if (!additionalRulesCheckResult) {
      return false;
    }

    const context = this.contextInternal$.value;
    return !!context?.rights ? context.rights.indexOf(right) !== -1 : false;
  }

  checkPermissionGroup(group: AccessPermissionGroup): boolean {
    if (!group.accessPermissions?.length) {
      return true;
    }
    const condition = group.accessPermissionsCondition ?? AccessPermissionCondition.OR;

    const permissions = group.accessPermissions.filter((item) => typeof item === 'string') as string[];

    const groups = group.accessPermissions.filter((item) => typeof item !== 'string') as AccessPermissionGroup[];

    let permissionCheckResult: boolean | undefined = undefined;
    let groupsCheckResult: boolean | undefined = undefined;

    if (permissions.length) {
      permissionCheckResult =
        condition === AccessPermissionCondition.OR ? this.hasAnyRights(permissions) : this.hasAllRights(permissions);
    }

    if (groups.length) {
      groupsCheckResult = groups.reduce((res, group) => {
        return condition === AccessPermissionCondition.OR
          ? res || this.checkPermissionGroup(group)
          : res && this.checkPermissionGroup(group);
      }, condition !== AccessPermissionCondition.OR);
    }

    if (permissionCheckResult !== undefined && groupsCheckResult !== undefined) {
      return condition === AccessPermissionCondition.OR
        ? permissionCheckResult || groupsCheckResult
        : permissionCheckResult && groupsCheckResult;
    }

    return !!(permissionCheckResult ?? groupsCheckResult);
  }

  private hasAnyRights(rights: string[]): boolean {
    return rights.reduce((res, right) => res || this.hasRight(right), false);
  }

  private hasAllRights(rights: string[]): boolean {
    return rights.reduce((res, right) => res && this.hasRight(right), true);
  }

  getConf(): ApplicationConfiguration | undefined {
    return this._serviceContext.conf;
  }

  debug(): boolean {
    const conf = this._serviceContext.conf;
    return conf?.debug || false;
  }

  triggerRightCheck(): void {
    this.triggerRightCheckInternal$.next(undefined);
  }

  reload(): void {
    this.triggerRightCheck();
  }

  ngOnDestroy(): void {
    this.contextInternal$.complete();
    this.triggerRightCheckInternal$.complete();
    this._globalReloadService.unRegister(this);
  }

  private redirectToOidc(): void {
    const conf = this.getConf();
    const startOidcEndpoint = conf!.miscParams![OIDC_ENDPOINT_PARAM];
    const location = this._document.defaultView!.location;
    const redirectUrl = `${startOidcEndpoint}?redirect_uri=${encodeURIComponent(location.href)}`;
    location.assign(redirectUrl);
  }

  private getSession(): Observable<SessionDto | unknown> {
    return (this._privateApplicationApi.getCurrentSession() as Observable<SessionDto>).pipe(
      switchMap((session) => {
        if (!session.otp) {
          return of(session);
        }
        return this._credentialsService.changePassword(true).pipe(
          map(() => {
            session.otp = true;
            return session;
          }),
          tap(() => {
            this._navigator.navigateAfterLogin();
          }),
        );
      }),
      tap((session) => this.setContextFromSession(session)),
      catchError((err) => {
        this.setContext({ userID: ANONYMOUS, role: 'public' });
        return of(err);
      }),
    );
  }
}
