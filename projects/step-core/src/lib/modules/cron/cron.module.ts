import { NgModule } from '@angular/core';
import { CronEditorComponent } from './components/cron-editor/cron-editor.component';
import { StepBasicsModule } from '../basics/step-basics.module';
import { StepMaterialModule } from '../step-material/step-material.module';
import { TabsModule } from '../tabs/tabs.module';
import { MinutesEditorComponent } from './components/minutes-editor/minutes-editor.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HoursEditorComponent } from './components/hours-editor/hours-editor.component';
import { EveryDayEditorComponent } from './components/every-day-editor/every-day-editor.component';
import { EveryWeekDayEditorComponent } from './components/every-week-day-editor/every-week-day-editor.component';
import { DailyEditorComponent } from './components/daily-editor/daily-editor.component';
import { WeeklyEditorComponent } from './components/weekly-editor/weekly-editor.component';
import { MonthlyDayEditorComponent } from './components/monthly-day-editor/monthly-day-editor.component';
import { MonthlyWeekEditorComponent } from './components/monthly-week-editor/monthly-week-editor.component';
import { MonthlyEditorComponent } from './components/monthly-editor/monthly-editor.component';
import { YearlyDayEditorComponent } from './components/yearly-day-editor/yearly-day-editor.component';
import { YearlyWeekEditorComponent } from './components/yearly-week-editor/yearly-week-editor.component';
import { YearlyEditorComponent } from './components/yearly-editor/yearly-editor.component';
import { PresetEditorComponent } from './components/preset-editor/preset-editor.component';
import { ValidateCronDirective } from './directives/validate-cron.directive';

@NgModule({
  declarations: [
    CronEditorComponent,
    MinutesEditorComponent,
    HoursEditorComponent,
    EveryDayEditorComponent,
    EveryWeekDayEditorComponent,
    DailyEditorComponent,
    WeeklyEditorComponent,
    MonthlyDayEditorComponent,
    MonthlyWeekEditorComponent,
    MonthlyEditorComponent,
    YearlyDayEditorComponent,
    YearlyWeekEditorComponent,
    YearlyEditorComponent,
    PresetEditorComponent,
    ValidateCronDirective,
  ],
  imports: [StepBasicsModule, TabsModule, StepMaterialModule, FormsModule, ReactiveFormsModule, CommonModule],
  exports: [ValidateCronDirective],
})
export class CronModule {}

export * from './injectables/cron.service';
export * from './components/cron-editor/cron-editor.component';
export * from './directives/validate-cron.directive';
export * from './types/cron-validator';
