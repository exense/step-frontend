import { ComponentFactoryResolver, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeBaseModule, ThemeRegisterService } from '@exense/step-core';
import { DefaultThemeComponent } from './components/default-theme/default-theme.component';

@NgModule({
  declarations: [DefaultThemeComponent],
  imports: [CommonModule],
})
export class DefaultThemeModule extends ThemeBaseModule<DefaultThemeComponent> {
  constructor(componentFactoryResolver: ComponentFactoryResolver, themeRegister: ThemeRegisterService) {
    super('default-theme', DefaultThemeComponent, componentFactoryResolver, themeRegister);
  }
}
