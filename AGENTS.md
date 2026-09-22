# Open-Source Frontend

OS must not depend on enterprise implementations. Add matching EE dependencies when adding OS dependencies.
Only commit or push when explicitly instructed by the user.
See [TESTING.md](TESTING.md) for test commands, shared browser helpers, and scenario coverage.

# Test-First Bug Fixes

- Before changing production code for a bug fix, add or extend a focused Jest regression test that reproduces the reported behavior. Prefer the existing scenario suite for that feature.
- Run that test against the unfixed implementation and verify that it fails for the expected behavioral reason. Compilation errors, missing providers, and broken mocks are not valid reproductions. Do not implement the fix before observing this failure.
- Make the smallest fix, rerun the same test, and retain it as a regression test. Refactor only after it passes. Report the failing behavior and the passing verification in the handoff.
- If Jest cannot reproduce the bug (for example, actual browser layout or native drag hit-testing), explain the limitation and use an appropriate executable browser reproducer before fixing it. Do not silently skip the reproducer or claim an unobserved red/green result.

# Test Scope And Execution

- Test observable behavior at the smallest useful scenario boundary. Test collaborating components together when they implement one feature (for example split/areas/gutters, table/filter/datasource/selection, or tree/drag/drop).
- Keep one test per meaningful workflow or distinct failure mode, with related assertions together. Extend existing cases where practical; avoid one test per method, trivial construction checks, private implementation assertions, large snapshots, and redundant permutations.
- Mock external boundaries such as APIs and missing browser capabilities; keep the collaborating implementation real. Use the shared `@exense/step-core/testing` ResizeObserver helper rather than adding per-test no-op mocks. Explicitly control geometry and time in layout-dependent tests.
- During reproduction and implementation, run only the relevant test files or named cases with `npm test -- --runInBand --runTestsByPath <path>` (optionally `-t '<case>'`). Expand to directly affected suites when dependencies change.
- Once implementation and targeted checks are complete, run the full Jest suite once with `npm test -- --runInBand` from the active repository, or from the workspace root to cover OS and EE together. Do not repeatedly run full suites while iterating. After a final-suite failure, debug with targeted runs; rerun the full suite after fixes are complete.
- After making changes, run the repository ESLint configuration on all changed/new TypeScript and HTML files, including staged and unstaged files, and fix errors and warnings. Use targeted ESLint commands, not full-repository lint commands; use narrowly scoped, explained exceptions when public APIs require them.
