import { ComponentFactoryResolver, Type } from '@angular/core';
import { ThemeRegisterService } from '../services/theme-register.service';

export abstract class ThemeBaseModule<T> {
  protected constructor(
    globalStyleClass: string,
    componentType: Type<T>,
    componentFactoryResolver: ComponentFactoryResolver,
    themeRegister: ThemeRegisterService
  ) {
    const componentFactory = componentFactoryResolver.resolveComponentFactory(componentType);
    themeRegister.register(globalStyleClass, componentFactory);
  }
}
