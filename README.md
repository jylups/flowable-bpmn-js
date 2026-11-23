# @jylups/flowable-bpmn-js

bpmn-js modeler and viewers for Flowable BPMN models, with the Flowable moddle descriptor ([@jylups/flowable-bpmn-moddle](https://github.com/jylups/flowable-bpmn-moddle)), modeling behaviors ([@jylups/flowable-bpmn-js-behaviors](https://github.com/jylups/flowable-bpmn-js-behaviors)) and properties panel ([@jylups/bpmn-js-properties-panel-flowable](https://github.com/jylups/bpmn-js-properties-panel-flowable)) built in.

> Work in progress. This package is being built in Phase 4 of the Flowable BPMN editor ([jylups/bpmn-js-env#39](https://github.com/jylups/bpmn-js-env/issues/39)). It is not published yet.

## Entry points

| Export | What it is |
| --- | --- |
| `Modeler` | bpmn-js `Modeler` with the Flowable descriptor, behaviors, the bpmn.io properties panel and the Flowable properties provider |
| `Viewer` | bpmn-js `Viewer` with the Flowable descriptor |
| `NavigatedViewer` | bpmn-js `NavigatedViewer` (zoom and scroll) with the Flowable descriptor |
| `FlowableXMLModule` | the import and save steps below, included in all three |

All three read and write models as Flowable needs them:

- **Activiti namespace:** Activiti spellings (`xmlns:activiti`) are read as Flowable.
- **Unknown elements:** `flowable:*` elements the descriptor doesn't define are kept.
- **References by code or name:** an `errorRef`, `messageRef`, `signalRef` or `escalationRef` gets the definition Flowable reads it as.
- **Saving:** everything is written with the `flowable` prefix.

They take the same options as their bpmn-js counterparts. `moddleExtensions` and `additionalModules` add to what is built in.

## Usage

```js
import { Modeler } from '@jylups/flowable-bpmn-js';

import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import '@bpmn-io/properties-panel/dist/assets/properties-panel.css';

const modeler = new Modeler({
  container: '#canvas',
  propertiesPanel: { parent: '#properties' }
});

await modeler.importXML(xml);

const { xml: saved } = await modeler.saveXML({ format: true });
```

The properties panel can also be attached later with `modeler.get('propertiesPanel').attachTo(element)`. The same CSS files ship in `@jylups/flowable-bpmn-js/dist/assets/`.

Typings come with the package (`index.d.ts`). bpmn-js' own typings need `"moduleResolution": "bundler"`, as Vite and other bundlers use.

## Browser distro

For pages without a bundler, `dist/` has one script per entry point. Each exposes the global `FlowableBpmnJS`:

```html
<link rel="stylesheet" href="https://unpkg.com/@jylups/flowable-bpmn-js/dist/assets/diagram-js.css">
<link rel="stylesheet" href="https://unpkg.com/@jylups/flowable-bpmn-js/dist/assets/bpmn-js.css">
<link rel="stylesheet" href="https://unpkg.com/@jylups/flowable-bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css">
<link rel="stylesheet" href="https://unpkg.com/@jylups/flowable-bpmn-js/dist/assets/properties-panel.css">
<script src="https://unpkg.com/@jylups/flowable-bpmn-js/dist/flowable-bpmn-modeler.production.min.js"></script>
<script>
  const modeler = new FlowableBpmnJS({ container: '#canvas', propertiesPanel: { parent: '#properties' } });
</script>
```

| Script | Size (minified) |
| --- | --- |
| `flowable-bpmn-modeler.production.min.js` | about 1.6 MB, mostly bpmn-js and the bpmn.io properties panel (including its FEEL editor) |
| `flowable-bpmn-viewer.production.min.js` | about 210 KB |
| `flowable-bpmn-navigated-viewer.production.min.js` | about 215 KB |

Each also comes as `.development.js`, unminified and with a source map.

## Licence note

bpmn-js requires the bpmn.io watermark to stay visible in rendered diagrams. This package keeps it.

## Development

Work in the [bpmn-js-env](https://github.com/jylups/bpmn-js-env) workspace, which links this package with the others and with the playground. Issues for this package are tracked there.

```sh
npm install
npm run lint
npm test              # Modeler and Viewer specs
npm run test:types    # compiles test/types/usage.ts against the typings
npm run distro        # builds dist/ with Rollup
npm run test:distro   # loads each dist script in the browser
npm run all           # everything above, as CI and the release workflow run it
```

The tests run in headless Chromium through Playwright. Either install Playwright's Chromium once with `npx playwright install chromium`, or use an installed Google Chrome with `TEST_BROWSER_CHANNEL=chrome npm test`.

## License

MIT
