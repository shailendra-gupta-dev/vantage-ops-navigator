// Static accessibility linting for Angular templates (WCAG 2.2 — see docs/accessibility.md).
// Scope is intentionally templates only: this config exists to catch a11y regressions in markup
// at commit/PR time. It is complemented by the axe-core browser checks in e2e/a11y.
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
  {
    ignores: ['dist/**', '.angular/**', 'node_modules/**', 'coverage/**', 'playwright-report/**', 'test-results/**'],
  },
  {
    files: ['src/**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {
      // Everything in the accessibility set is an error: a11y issues must not be merged as warnings.
      '@angular-eslint/template/alt-text': 'error',
      '@angular-eslint/template/click-events-have-key-events': 'error',
      '@angular-eslint/template/elements-content': 'error',
      '@angular-eslint/template/interactive-supports-focus': 'error',
      '@angular-eslint/template/label-has-associated-control': 'error',
      '@angular-eslint/template/mouse-events-have-key-events': 'error',
      '@angular-eslint/template/no-autofocus': 'error',
      '@angular-eslint/template/no-distracting-elements': 'error',
      '@angular-eslint/template/no-positive-tabindex': 'error',
      '@angular-eslint/template/role-has-required-aria': 'error',
      '@angular-eslint/template/table-scope': 'error',
      '@angular-eslint/template/valid-aria': 'error',
    },
  },
);
