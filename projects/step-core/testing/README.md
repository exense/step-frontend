# Jest Browser Helpers

Import `installResizeObserverMock` from `@exense/step-core/testing` and call it once in `setupFilesAfterEnv`. Import `resizeObserverMock` in tests and call `resizeObserverMock.resize(element, { width, height })` to provide geometry and synchronously deliver notifications. Observers and element geometry reset after each test.

This mock supplies equal content, border, and device-pixel box sizes. It does not perform layout or notify automatically on observe. Use browser tests for real CSS layout and native drag behavior.
