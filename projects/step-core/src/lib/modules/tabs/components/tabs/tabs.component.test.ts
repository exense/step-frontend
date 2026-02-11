import { Component, model, signal } from '@angular/core';
import { Tab } from '../../shared/tab';
import { TAB_EXPORTS, TabsComponent } from '../../index';
import { provideRouter, Router, RouterModule, withHashLocation } from '@angular/router';
import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatTabLink } from '@angular/material/tabs';

const TABS: Tab<string>[] = [
  { id: 'first', label: 'First', link: '/first' },
  { id: 'second', label: 'Second', link: '/second' },
  { id: 'third', label: 'Third', link: '/third' },
];

@Component({
  selector: 'step-tab-one',
  template: `<section class="tab-content">TAB 1</section>`,
})
class TabOneComponent {}

@Component({
  selector: 'step-tab-two',
  template: `<section class="tab-content">TAB 2</section>`,
})
class TabTwoComponent {}

@Component({
  selector: 'step-tab-three',
  template: `<section class="tab-content">TAB 3</section>`,
})
class TabThreeComponent {}

abstract class TestTabsBase {
  readonly selectedTab = model('first');
  readonly tabMode = signal<'buttons' | 'tabs'>('buttons');
  readonly isShrink = signal(false);
  protected readonly TABS = TABS;
}

@Component({
  selector: 'step-test-tabs-inline-children',
  imports: [TAB_EXPORTS, TabOneComponent, TabTwoComponent, TabThreeComponent],
  template: `
    <step-tabs [tabs]="TABS" [(activeTabId)]="selectedTab" [tabMode]="tabMode()" [shrink]="isShrink()" />
    @switch (selectedTab()) {
      @case ('first') {
        <step-tab-one />
      }
      @case ('second') {
        <step-tab-two />
      }
      @case ('third') {
        <step-tab-three />
      }
    }
  `,
})
class TestTabsInlineChildrenComponent extends TestTabsBase {}

@Component({
  selector: 'step-test-tabs-router-children',
  imports: [TAB_EXPORTS, RouterModule],
  template: `
    <step-tabs [tabs]="TABS" [tabTemplate]="tplTab" [userRouteLinks]="true" />
    <router-outlet />
    <ng-template #tplTab let-tab>
      <strong class="tab-header">Input Template: {{ tab.label }}</strong>
    </ng-template>
  `,
})
class TestTabsRouterChildrenComponent extends TestTabsBase {}

@Component({
  selector: 'step-test-tabs-router-children-with-template-directive',
  imports: [TAB_EXPORTS, RouterModule],
  template: `
    <step-tabs [tabs]="TABS" [userRouteLinks]="true">
      <strong class="tab-another-header" *stepTabTemplate="let tab">Directive Template: {{ tab.label }}</strong>
    </step-tabs>
    <router-outlet />
  `,
})
class TestTabsRouterChildrenWithTemplateDirectiveComponent extends TestTabsBase {}

describe('Tabs', () => {
  const checkTabSelection = <T>(fixture: ComponentFixture<T>, activeTabIndex: number) => {
    const tabs = fixture.debugElement.queryAll(By.directive(MatTabLink));
    tabs.forEach((tab, i) => {
      if (i === activeTabIndex) {
        expect(tab.componentInstance.active).toBeTruthy();
      } else {
        expect(tab.componentInstance.active).toBeFalsy();
      }
    });

    const tabContent = fixture.nativeElement.querySelector('.tab-content');
    expect(tabContent).toBeTruthy();
    expect(tabContent.textContent).toEqual(`TAB ${activeTabIndex + 1}`);
  };

  describe('Inline tabs content', () => {
    let component: TestTabsInlineChildrenComponent;
    let fixture: ComponentFixture<TestTabsInlineChildrenComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestTabsInlineChildrenComponent],
      }).compileComponents();
      fixture = TestBed.createComponent(TestTabsInlineChildrenComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('Initial view', () => {
      const tabs = fixture.debugElement.queryAll(By.directive(MatTabLink));
      expect(tabs.length).toBe(TABS.length);
      tabs.forEach((tab, i) => {
        expect(tab.nativeElement.textContent.trim()).toEqual(TABS[i].label);
      });
    });

    it('Tabs switch by click', async () => {
      expect(component.selectedTab()).toBe('first');
      checkTabSelection(fixture, 0);

      let tabElement = fixture.debugElement.query(By.css('[data-step-testid="tab-selector-second"]'));
      expect(tabElement).toBeTruthy();
      tabElement.triggerEventHandler('click', null);

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.selectedTab()).toBe('second');
      checkTabSelection(fixture, 1);

      tabElement = fixture.debugElement.query(By.css('[data-step-testid="tab-selector-third"]'));
      expect(tabElement).toBeTruthy();
      tabElement.triggerEventHandler('click', null);

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.selectedTab()).toBe('third');
      checkTabSelection(fixture, 2);

      tabElement = fixture.debugElement.query(By.css('[data-step-testid="tab-selector-first"]'));
      expect(tabElement).toBeTruthy();
      tabElement.triggerEventHandler('click', null);

      fixture.detectChanges();
      await fixture.whenStable();

      checkTabSelection(fixture, 0);
    });

    it('Tab switch by model change', async () => {
      checkTabSelection(fixture, 0);

      component.selectedTab.set('second');
      fixture.detectChanges();
      await fixture.whenStable();

      checkTabSelection(fixture, 1);

      component.selectedTab.set('third');
      fixture.detectChanges();
      await fixture.whenStable();

      checkTabSelection(fixture, 2);

      component.selectedTab.set('first');
      fixture.detectChanges();
      await fixture.whenStable();

      checkTabSelection(fixture, 0);
    });

    it('Class changes based on component inputs', async () => {
      const tabs = fixture.debugElement.query(By.directive(TabsComponent));
      expect(tabs.nativeElement.classList.contains('tab-mode-buttons')).toBeTruthy();
      expect(tabs.nativeElement.classList.contains('tab-mode-tabs')).toBeFalsy();
      expect(tabs.nativeElement.classList.contains('shrink')).toBeFalsy();

      component.tabMode.set('tabs');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(tabs.nativeElement.classList.contains('tab-mode-buttons')).toBeFalsy();
      expect(tabs.nativeElement.classList.contains('tab-mode-tabs')).toBeTruthy();
      expect(tabs.nativeElement.classList.contains('shrink')).toBeFalsy();

      component.isShrink.set(true);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(tabs.nativeElement.classList.contains('tab-mode-buttons')).toBeFalsy();
      expect(tabs.nativeElement.classList.contains('tab-mode-tabs')).toBeTruthy();
      expect(tabs.nativeElement.classList.contains('shrink')).toBeTruthy();
    });
  });

  describe('Router tabs', () => {
    let fixture: ComponentFixture<TestTabsRouterChildrenComponent>;
    let router: Router;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestTabsRouterChildrenComponent],
        providers: [
          provideRouter(
            [
              { path: '', redirectTo: TABS[0].id, pathMatch: 'full' },
              { path: TABS[0].id, component: TabOneComponent },
              { path: TABS[1].id, component: TabTwoComponent },
              { path: TABS[2].id, component: TabThreeComponent },
            ],
            withHashLocation(),
          ),
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(TestTabsRouterChildrenComponent);
      router = TestBed.inject(Router);
      router.initialNavigation();

      fixture.detectChanges();
    });

    it('Initial view', () => {
      const tabs = fixture.debugElement.queryAll(By.directive(MatTabLink));
      expect(tabs.length).toBe(TABS.length);
      tabs.forEach((tab, i) => {
        expect(tab.nativeElement.textContent.trim()).toEqual(`Input Template: ${TABS[i].label}`);
      });
    });

    // RouterLink and RouterLinkActive contains logic, which relies on observable chains
    // It's hard to achieve in unit tests, when these chains are over and doesn't flush any new result
    // To test it `fakeAsync` is used. It allows to control async task's execution manually.

    it('Tab switch by click', fakeAsync(() => {
      flushMicrotasks();
      fixture.detectChanges();

      expect(router.url).toEqual('/first');

      checkTabSelection(fixture, 0);

      let tabElement = fixture.debugElement.query(By.css('[data-step-testid="tab-selector-second"]'));
      expect(tabElement).toBeTruthy();
      tabElement.triggerEventHandler('click', { button: 0 });

      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();

      expect(router.url).toEqual('/second');
      checkTabSelection(fixture, 1);

      tabElement = fixture.debugElement.query(By.css('[data-step-testid="tab-selector-third"]'));
      expect(tabElement).toBeTruthy();
      tabElement.triggerEventHandler('click', { button: 0 });

      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();

      expect(router.url).toEqual('/third');
      checkTabSelection(fixture, 2);

      tabElement = fixture.debugElement.query(By.css('[data-step-testid="tab-selector-first"]'));
      expect(tabElement).toBeTruthy();
      tabElement.triggerEventHandler('click', { button: 0 });

      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();

      checkTabSelection(fixture, 0);
    }));

    it('Tab switch by router change', fakeAsync(() => {
      flushMicrotasks();
      fixture.detectChanges();

      checkTabSelection(fixture, 0);

      router.navigateByUrl('/second');
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();

      checkTabSelection(fixture, 1);

      router.navigateByUrl('/third');
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();

      checkTabSelection(fixture, 2);

      router.navigateByUrl('/first');
      fixture.detectChanges();
      flushMicrotasks();
      fixture.detectChanges();

      checkTabSelection(fixture, 0);
    }));
  });

  describe('Tabs with template directive', () => {
    let fixture: ComponentFixture<TestTabsRouterChildrenComponent>;
    let router: Router;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestTabsRouterChildrenWithTemplateDirectiveComponent],
        providers: [
          provideRouter(
            [
              { path: '', redirectTo: TABS[0].id, pathMatch: 'full' },
              { path: TABS[0].id, component: TabOneComponent },
              { path: TABS[1].id, component: TabTwoComponent },
              { path: TABS[2].id, component: TabThreeComponent },
            ],
            withHashLocation(),
          ),
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(TestTabsRouterChildrenWithTemplateDirectiveComponent);
      router = TestBed.inject(Router);
      router.initialNavigation();

      fixture.detectChanges();
    });

    it('Initial view', () => {
      const tabs = fixture.debugElement.queryAll(By.directive(MatTabLink));
      expect(tabs.length).toBe(TABS.length);
      tabs.forEach((tab, i) => {
        expect(tab.nativeElement.textContent.trim()).toEqual(`Directive Template: ${TABS[i].label}`);
      });
    });
  });
});
