/*
 * Compiled with `npm run test:types` to check the typings; not run. Uses
 * bundler module resolution, as Vite and other bundlers do; bpmn-js' own
 * typings need it.
 */
import { FlowableXMLModule, Modeler, NavigatedViewer, Viewer } from '@jylups/flowable-bpmn-js';

const container = document.createElement('div');

const modeler = new Modeler({
  container,
  propertiesPanel: { parent: '#properties' },
  additionalModules: [ FlowableXMLModule ]
});

async function open(xml: string): Promise<string | undefined> {
  const { warnings } = await modeler.importXML(xml);

  console.log(`${ warnings.length } import warnings`);

  const { xml: saved } = await modeler.saveXML({ format: true });

  return saved;
}

new Viewer({ container }).importXML('<definitions />');
new NavigatedViewer({ container }).destroy();

open('<definitions />');
