import { AngularApplicationOptionsSchema } from '@angular/cli/lib/config/workspace-schema';
import { MfSchematicSchema } from '@angular-architects/module-federation/src/schematics/mf/schema';

export interface Schema
  extends Pick<AngularApplicationOptionsSchema, 'name' | 'prefix'>,
    Pick<MfSchematicSchema, 'port'> {}
