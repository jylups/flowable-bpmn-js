import {
  migrateActivitiXML,
  registerUnknownFlowableElements,
  useFlowablePrefix
} from '@jylups/flowable-bpmn-moddle';

import { createMissingDefinitions } from '@jylups/flowable-bpmn-js-behaviors/missing-definitions';

/**
 * Runs before bpmn-js claims the imported IDs, so created definitions are
 * claimed too.
 */
const HIGH_PRIORITY = 1500;


/**
 * Reads and writes Flowable models the way the Flowable descriptor needs:
 *
 * - on import, Activiti namespace declarations move to the Flowable
 *   namespace (migrateActivitiXML), and flowable:* elements the descriptor
 *   does not define are registered so they are kept
 *   (registerUnknownFlowableElements);
 * - references Flowable resolves by code or name get the error, message,
 *   signal or escalation they stand for (createMissingDefinitions from the
 *   behaviors package), in the viewers too;
 * - on save, other prefixes bound to the Flowable namespace are dropped, so
 *   everything is written as flowable: (useFlowablePrefix).
 */
export default class FlowableXML {

  constructor(eventBus, moddle) {
    eventBus.on('import.parse.start', ({ xml }) => {
      const migrated = migrateActivitiXML(xml);

      registerUnknownFlowableElements(moddle, migrated);

      return migrated;
    });

    eventBus.on('import.parse.complete', HIGH_PRIORITY, ({ error, definitions, warnings, elementsById }) => {
      if (!error && definitions) {
        createMissingDefinitions(definitions, { warnings, elementsById });
      }
    });

    eventBus.on('saveXML.start', ({ definitions }) => useFlowablePrefix(definitions));
  }
}

FlowableXML.$inject = [ 'eventBus', 'moddle' ];
