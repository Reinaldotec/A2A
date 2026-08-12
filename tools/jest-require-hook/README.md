# ESLint Rule: jest/require-hook

This rule requires setup and teardown code to be within a Jest hook (`beforeEach`, `beforeAll`, `afterEach`, `afterAll`).

## Rule Details

The rule flags any expression that is either at the top level of a test file or directly within the body of a `describe` block, with specific exceptions for declarations and standard Jest globals.

### Exceptions

The following are allowed outside of hooks:
- `import` statements
- `const` variable declarations
- `let` declarations without initialization, or initialized to `null` or `undefined`
- `class` declarations
- TypeScript types (`TSTypeAliasDeclaration`, `TSInterfaceDeclaration`, `TSEnumDeclaration`)
- Standard Jest globals:
  - Lifecycle hooks: `beforeEach`, `beforeAll`, `afterEach`, `afterAll`
  - Test blocks: `describe`, `test`, `it`, `fdescribe`, `xdescribe`, `fit`, `xit`, `xtest`
  - Mocking: `jest.mock`, `jest.doMock`, `jest.unmock`, `jest.spyOn`, etc.

## Options

### `allowedFunctionCalls`

An array of function names that are allowed to be called outside of hooks.

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

## Implementation Files

- `require-hook.js`: The ESLint rule implementation.
- `require-hook.test.js`: Comprehensive test suite for the rule.
