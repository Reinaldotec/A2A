'use strict';



const isJestGlobal = (node) => {
  const jestGlobals = new Set([
    'describe',
    'test',
    'it',
    'beforeEach',
    'afterEach',
    'beforeAll',
    'afterAll',
    'fdescribe',
    'xdescribe',
    'fit',
    'xit',
    'xtest',
  ]);

  if (node.type === 'CallExpression') {
    if (node.callee.type === 'Identifier' && jestGlobals.has(node.callee.name)) {
      return true;
    }
    if (
      node.callee.type === 'MemberExpression' &&
      node.callee.object.type === 'Identifier' &&
      node.callee.object.name === 'jest'
    ) {
      return true;
    }
  }
  return false;
};

const isAllowedExpression = (node, allowedFunctionCalls) => {
  if (node.type === 'ImportDeclaration') {
    return true;
  }

  if (node.type === 'VariableDeclaration') {
    if (node.kind === 'const') {
      return true;
    }
    if (node.kind === 'let') {
      return node.declarations.every(
        (decl) =>
          !decl.init ||
          (decl.init.type === 'Identifier' && decl.init.name === 'undefined') ||
          (decl.init.type === 'Literal' && decl.init.value === null)
      );
    }
  }

  if (
    node.type === 'ClassDeclaration' ||
    node.type === 'TSTypeAliasDeclaration' ||
    node.type === 'TSInterfaceDeclaration' ||
    node.type === 'TSEnumDeclaration'
  ) {
    return true;
  }

  if (node.type === 'ExpressionStatement') {
    const expression = node.expression;
    if (isJestGlobal(expression)) {
      return true;
    }
    if (
      expression.type === 'CallExpression' &&
      expression.callee.type === 'Identifier' &&
      allowedFunctionCalls.includes(expression.callee.name)
    ) {
      return true;
    }
  }

  return false;
};

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require setup and teardown code to be within a hook',
      category: 'Best Practices',
      recommended: false,
      url: 'https://github.com/jest-community/eslint-plugin-jest/blob/main/docs/rules/require-hook.md',
    },
    messages: {
      requireHook: 'This expression should be within a hook',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedFunctionCalls: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = context.options[0] || {};
    const allowedFunctionCalls = options.allowedFunctionCalls || [];

    const checkBody = (body) => {
      body.forEach((node) => {
        if (!isAllowedExpression(node, allowedFunctionCalls)) {
          context.report({
            node,
            messageId: 'requireHook',
          });
        }
      });
    };

    return {
      Program(node) {
        checkBody(node.body);
      },
      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          (node.callee.name === 'describe' || node.callee.name === 'fdescribe' || node.callee.name === 'xdescribe') &&
          node.arguments.length >= 2 &&
          (node.arguments[1].type === 'FunctionExpression' || node.arguments[1].type === 'ArrowFunctionExpression') &&
          node.arguments[1].body.type === 'BlockStatement'
        ) {
          checkBody(node.arguments[1].body.body);
        }
      },
    };
  },
};
