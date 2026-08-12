---
title: jest/require-hook
subtitle: Keep setup and teardown inside Jest lifecycle hooks
---

# jest/require-hook

The `jest/require-hook` ESLint rule keeps test setup and teardown in the place where Jest expects it: lifecycle hooks.

> **Why it matters:** Jest evaluates every `describe` handler in a test file before it executes the actual tests. Setup work that runs directly in a file or inside a `describe` block can therefore leak between tests, create ordering surprises, and make isolation harder to reason about.

## Rule details

The rule reports expressions that appear at the top level of a test file or directly inside the body of a `describe` block, with focused exceptions for declarations and standard Jest globals.

The following constructs are allowed outside hooks:

| Allowed construct | Examples |
| --- | --- |
| Imports | `import { database } from '../database';` |
| Constant declarations | `const makeCity = () => ({ name: 'Vienna' });` |
| Uninitialized `let` declarations | `let consoleWarnSpy;` |
| `let` initialized to `null` or `undefined` | `let connection = null;` |
| Classes and TypeScript types | `class Database {}` and type/interface declarations |
| Standard Jest globals | `describe`, `test`, `it`, `beforeEach`, `afterEach`, `jest.mock`, and related globals |

Function calls that are not part of the allowed Jest API should be moved into `beforeEach`, `beforeAll`, `afterEach`, or `afterAll`.

## Incorrect

The following setup and teardown calls run while the test file is being evaluated and are reported by the rule:

```js
import { database } from '../database';

const initializeCityDatabase = () => {
  database.addCity('Vienna');
  database.addCity('San Juan');
};

initializeCityDatabase();

describe('when loading cities from the api', () => {
  loadCities.mockResolvedValue(['Wellington', 'London']);

  it('does not duplicate cities', async () => {
    await database.loadCities();
    expect(database.cities).toHaveLength(4);
  });
});

clearCityDatabase();
```

## Correct

Wrap setup and teardown in Jest lifecycle hooks so each test starts from an intentional state:

```js
import { database } from '../database';

const initializeCityDatabase = () => {
  database.addCity('Vienna');
  database.addCity('San Juan');
};

const clearCityDatabase = () => {
  database.clear();
};

beforeEach(() => {
  initializeCityDatabase();
});

describe('when loading cities from the api', () => {
  let consoleWarnSpy;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn');
    loadCities.mockResolvedValue(['Wellington', 'London']);
  });

  it('does not duplicate cities', async () => {
    await database.loadCities();
    expect(database.cities).toHaveLength(4);
  });
});

afterEach(() => {
  clearCityDatabase();
});
```

## Configuration

If a utility must run outside a hook, allow it explicitly with `allowedFunctionCalls`. Keeping this list narrow makes the exception visible during code review.

```json
{
  "jest/require-hook": [
    "error",
    {
      "allowedFunctionCalls": ["enableAutoDestroy"]
    }
  ]
}
```

With that option, the following is valid:

```js
import { enableAutoDestroy } from '@vue/test-utils';

// Explicitly allowed by the rule configuration.
enableAutoDestroy(afterEach);

beforeEach(initDatabase);
afterEach(tearDownDatabase);
```

## Custom implementation files

This fork keeps the standalone implementation and tests in [`tools/jest-require-hook/`](https://github.com/Reinaldotec/A2A/tree/main/tools/jest-require-hook). The package is isolated from the A2A protocol build and can be tested independently with `npm test --prefix tools/jest-require-hook`.

## Source specification

This page is based on the [`require-hook.md`](https://github.com/Reinaldotec/A2A/blob/main/tools/jest-require-hook/require-hook.md) rule specification and its companion [`README.md`](https://github.com/Reinaldotec/A2A/blob/main/tools/jest-require-hook/README.md).
