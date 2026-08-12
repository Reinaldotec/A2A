'use strict';

const { RuleTester } = require('eslint');
const rule = require('./require-hook');

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
});

ruleTester.run('require-hook', rule, {
  valid: [
    'import { database } from "../database";',
    'const initializeCityDatabase = () => {};',
    'let consoleWarnSpy;',
    'let x = null;',
    'let y = undefined;',
    'beforeEach(() => { initializeCityDatabase(); });',
    'test("that persists cities", () => {});',
    'describe("when loading cities", () => { beforeEach(() => {}); it("works", () => {}); });',
    'jest.mock("../api");',
    {
      code: 'enableAutoDestroy(afterEach);',
      options: [{ allowedFunctionCalls: ['enableAutoDestroy'] }],
    },
    'class Foo {}',
    'describe("foo", () => { const x = 1; test("bar", () => {}); });',
    'describe("foo", () => { let x; test("bar", () => {}); });',
    'describe("foo", () => { let x = null; test("bar", () => {}); });',
    'jest.doMock("bar", () => {});',
    'jest.unmock("bar");',
    'jest.spyOn(console, "log");',
  ],
  invalid: [
    {
      code: 'initializeCityDatabase();',
      errors: [{ messageId: 'requireHook' }],
    },
    {
      code: 'describe("foo", () => { initializeCityDatabase(); });',
      errors: [{ messageId: 'requireHook' }],
    },
    {
      code: 'describe("foo", () => { describe("bar", () => { setup(); }); });',
      errors: [{ messageId: 'requireHook' }],
    },
    {
      code: 'let x = 1;',
      errors: [{ messageId: 'requireHook' }],
    },
    {
      code: 'describe("foo", () => { let x = 1; });',
      errors: [{ messageId: 'requireHook' }],
    },
    {
      code: 'describe("when loading cities", () => { loadCities.mockResolvedValue([]); });',
      errors: [{ messageId: 'requireHook' }],
    },
    {
      code: 'clearCityDatabase();',
      errors: [{ messageId: 'requireHook' }],
    },
  ],
});

console.log('Tests passed!');
