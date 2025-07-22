import { AngularApplicationOptionsSchema } from '@angular/cli/lib/config/workspace-schema';

interface PortContainer {
  port: string | number;
}

export interface Schema extends Pick<AngularApplicationOptionsSchema, 'name' | 'prefix'>, PortContainer {}
