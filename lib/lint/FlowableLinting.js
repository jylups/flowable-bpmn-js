import { createFlowableLinterConfig } from './index.js';

/**
 * After bpmn-js-bpmnlint read its configuration: lints with the Flowable
 * rules unless `linting.bpmnlint` sets another linter configuration, and
 * shows the issues unless `linting.active` is false.
 */
export default class FlowableLinting {

  constructor(config, eventBus, linting) {
    eventBus.once('diagram.init', () => {
      if (!config || !config.bpmnlint) {
        linting.setLinterConfig(createFlowableLinterConfig());
      }

      if (!config || config.active !== false) {
        linting.toggle(true);
      }
    });
  }
}

FlowableLinting.$inject = [ 'config.linting', 'eventBus', 'linting' ];
