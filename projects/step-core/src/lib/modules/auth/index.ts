import { HasRightPipe } from './pipes/has-right.pipe';

export * from './guards/auth.guards';
export * from './guards/check-permissions.guard';

export * from './injectables/auth.service';
export * from './injectables/additional-right-rule.service';
export * from './injectables/credentials.service';
export * from './injectables/logout-cleanup.token';
export * from './injectables/users.service';

export * from './pipes/has-right.pipe';

export * from './types/additional-right-rule';
export * from './types/auth-context.interface';
export * from './types/credentials-strategy';

export const AUTH_EXPORTS = [HasRightPipe];
