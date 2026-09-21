# Frontend Testing

Use Jest for deterministic behavior tests. The test-first bug-fix policy is in [AGENTS.md](AGENTS.md).

## Running Tests

From this repository:

```sh
npm test -- --runInBand --runTestsByPath projects/step-core/src/lib/modules/tree/tree.scenario.test.ts
npm test -- --runInBand --runTestsByPath projects/step-core/src/lib/modules/tree/tree.scenario.test.ts -t 'delivers one drop'
```

From the workspace root, prefix the file path with `step-frontend/`. The workspace Jest configuration includes OS and EE tests. Iterate with the affected cases, then run `npm test -- --runInBand` once at completion. Standalone OS runs only OS tests; standalone EE runs only EE tests. Neither requires a full application build to run source tests.

## Shared Browser Support

All three Jest configurations load the shared setup file to install the same controllable `ResizeObserver` implementation. `resizeObservable` is the application wrapper around that browser API, not a missing Jest API itself.

```ts
import { resizeObserverMock } from '@exense/step-core/testing';

resizeObserverMock.resize(element, { width: 320, height: 100 });
fixture.detectChanges();
tick(300); // When the behavior under test is debounced, inside fakeAsync.
fixture.detectChanges();
```

`resize` sets the target's bounding rectangle, offset size, and client size, then synchronously notifies observers currently observing that target. It works with direct ResizeObserver users and the RxJS wrapper. `unobserve` and `disconnect` stop delivery; multiple observers are supported. Setup resets registrations and restores geometry after every test. Destroy fixtures and unsubscribe normally; reset is an isolation safeguard.

The helper does not calculate CSS layout, border/padding differences, device-pixel scaling, or automatically notify on `observe`. All reported box sizes are the supplied dimensions, with origin `(0, 0)`. Use browser tests for pixel layout, drag hit-testing, scrolling geometry, and responsive visual verification. Jest drag tests dispatch DOM events to exercise our handlers and integrations.

The helper lives in `projects/step-core/testing` and is copied into the built core package as an asset, with a separate `@exense/step-core/testing` export. It uses CommonJS plus TypeScript declarations so standalone EE Jest can load it from node_modules without transforming the package or importing the production barrel. OS and workspace TypeScript paths resolve it directly to source. EE Jest uses the sibling OS source when available and otherwise resolves the installed core package. Package consumers need a core artifact containing this new entry point.

## Scenario Coverage

The initial inventory found 44 OS Jest files and one EE file, primarily individual components and utilities. There were no split, table, or tree suites and no common controllable ResizeObserver support. This is a source/test inventory, not a measured line-coverage percentage.

| Suite                                    | Behavior Covered                                                                                                                                   |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `basics/types/resize-observable.test.ts` | Real size directive plus observable delivery, debouncing, and unsubscribe                                                                          |
| `split/split.scenario.test.ts`           | Split, areas, and gutters together: drag, fixed area, size events, bounds, mouseup                                                                 |
| `table/table.scenario.test.ts`           | Local sorting/paging/filtering/selection; custom columns and settings; remote request debounce, stale responses and recovery; fetched local reload |
| `tree/tree.scenario.test.ts`             | Expansion/collapse, selection, drag/drop payload, single drop delivery, disabled dragging and cleanup                                              |

The tree drop case reproduces duplicate listener registration: a single drop previously emitted twice, with the second event missing the dragged node.

These are representative workflows, not exhaustive coverage. Remaining candidates should be driven by bugs and feature risk: persisted URL/search restoration, remote bulk selection, date/compound filters, custom cell registry variants, tree multi-selection/lazy loading/virtual scrolling, cross-container drag/drop, and other resize consumers (clamp/fade, shrink lists, charts). Add a new case only for a distinct contract; do not duplicate these workflows for every constituent directive or service.
