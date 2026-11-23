import StaticResolver from 'bpmnlint/lib/resolver/static-resolver';

import calledElement from './rules/called-element.js';
import serviceTaskImplementation from './rules/service-task-implementation.js';
import validDurations from './rules/valid-durations.js';

const PACKAGE = 'bpmnlint-plugin-flowable';

/**
 * The Flowable lint rules, as bpmnlint rule factories by name.
 */
export const FLOWABLE_RULES = {
  'called-element': calledElement,
  'service-task-implementation': serviceTaskImplementation,
  'valid-durations': validDurations
};

/**
 * A bpmnlint configuration with the Flowable rules, all reported as errors.
 */
export const flowableLintConfig = {
  rules: Object.fromEntries(Object.keys(FLOWABLE_RULES).map(name => [ `flowable/${ name }`, 'error' ]))
};

/**
 * The linter configuration for bpmn-js-bpmnlint: `{ config, resolver }`.
 *
 * @param {Object} [config] - a bpmnlint configuration; the Flowable rules by
 *   default. Rules named `flowable/<rule>` resolve to the Flowable rules;
 *   other rules and configurations need a resolver of their own.
 *
 * @return {{ config: Object, resolver: StaticResolver }}
 */
export function createFlowableLinterConfig(config = flowableLintConfig) {
  const cache = {};

  Object.entries(FLOWABLE_RULES).forEach(([ name, rule ]) => {
    cache[`rule:${ PACKAGE }/${ name }`] = rule;
  });

  cache[`config:${ PACKAGE }/recommended`] = flowableLintConfig;

  return { config, resolver: new StaticResolver(cache) };
}
