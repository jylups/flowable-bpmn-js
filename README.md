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
| `FlowableDrawModule` | draws the typed service tasks with their icons, included in all three |
| `TouchModule` | touch editing for the modeler, optional (see below) |
| `FlowableLintModule` | linting with the Flowable rules, included in `Modeler` (see below) |

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
import 'bpmn-js-bpmnlint/dist/assets/css/bpmn-js-bpmnlint.css';
import '@jylups/flowable-bpmn-js/assets/flowable-bpmn-js.css';

const modeler = new Modeler({
  container: '#canvas',
  propertiesPanel: { parent: '#properties' }
});

await modeler.importXML(xml);

const { xml: saved } = await modeler.saveXML({ format: true });
```

The same CSS files ship in `@jylups/flowable-bpmn-js/dist/assets/`. The linting stylesheet also hides each issue list until it is opened, so leaving it out puts the lists over the diagram.

The properties panel can also be attached later with `modeler.get('propertiesPanel').attachTo(element)`.

Typings come with the package (`index.d.ts`). bpmn-js' own typings need `"moduleResolution": "bundler"`, as Vite and other bundlers use.

## Typed service tasks

The modeler's palette and replace menu offer Flowable's typed service tasks: mail, HTTP, shell, Camel, decision (`dmn`), case, send event and external worker. Each is a `bpmn:ServiceTask` with that `flowable:type`; an HTTP task starts with `requestMethod` GET.

Choosing a type in the replace menu is one undo step:

- An element that isn't a service task is replaced with one, and the behaviors drop what a service task can't hold.
- What the previous implementation set is removed: its Java class or expression, result variable options, case and external worker attributes, fields, HTTP handlers, and event and worker parameters.
- Listeners, async settings, multi-instance and the form key stay.

A typed task also gets a "Service task" entry that removes the type.

Typed tasks are drawn with their own icon instead of the service task gear, in the modeler and the viewers. The icons were drawn for this project. `assets/flowable-bpmn-js.css` shows them in the palette and the replace menu; it fills them with the text color, so they follow the theme like the bpmn-js icons.

## Linting

The modeler lints the diagram while it is edited, with [bpmnlint](https://github.com/bpmn-io/bpmnlint) and [bpmn-js-bpmnlint](https://github.com/bpmn-io/bpmn-js-bpmnlint). Issues show on the elements; a button in the corner counts them and turns the overlays on and off. Its stylesheet is `bpmn-js-bpmnlint.css`.

| Rule | Reports |
| --- | --- |
| `flowable/service-task-implementation` | a service task without a Java class, expression, delegate expression, type or web service operation; a typed task without what it needs: HTTP request URL, shell command, decision table key, case definition key, send event key, external worker topic |
| `flowable/valid-durations` | a user task due date, timer date, duration, cycle or cycle end date, or retry time cycle that isn't valid ISO 8601 (or, for cycles, a cron expression); a timer without a value. Values with an expression pass |
| `flowable/called-element` | a call activity without a called element |

All are errors. To list the issues in a problems view, listen to `linting.completed`:

```js
modeler.on('linting.completed', ({ issues }) => {
  // { elementId: [ { message, category: 'error' | 'warn', rule } ] }
});
```

Options:
- `linting: { active: false }` starts with the overlays hidden. The issues are still reported.
- `linting: { bpmnlint }` sets another linter configuration. `createFlowableLinterConfig(config)` builds one that can use the `flowable/…` rules, and `FLOWABLE_RULES` has the rules for a resolver of your own.

## Touch

`TouchModule` adds touch editing to the modeler:

- tap to select, drag to move, one finger to pan and a pinch to zoom;
- a double tap edits a label, and a tap elsewhere finishes the edit;
- create from the palette and connect from the context pad by dragging.

It turns itself on only where `(pointer: coarse)` matches, such as iPads and Android tablets, so a desktop with a mouse is unchanged. `assets/flowable-bpmn-js-touch.css` makes shapes, connections, handles and context pad entries easier to hit with a finger.

```js
import { Modeler, TouchModule } from '@jylups/flowable-bpmn-js';

import '@jylups/flowable-bpmn-js/assets/flowable-bpmn-js-touch.css';

const modeler = new Modeler({
  container: '#canvas',
  additionalModules: [ TouchModule ]
});
```

The gestures come from [bpmn-js-touch-interaction](https://github.com/krasucki/bpmn-js-touch-interaction) 0.1.2 (MIT, see `lib/features/touch/LICENSE`). They are taken as adapted in `@jylups/cmmn-js` 0.23.0, with fixes for tablets with a trackpad, bendpoint dragging, label editing and the context pad, and use ES modules again. Changes to the original are marked `CHANGED:` in `lib/features/touch/TouchInteraction.js`.

## Browser distro

For pages without a bundler, `dist/` has one script per entry point. Each exposes the global `FlowableBpmnJS`:

```html
<link rel="stylesheet" href="https://unpkg.com/@jylups/flowable-bpmn-js/dist/assets/diagram-js.css">
<link rel="stylesheet" href="https://unpkg.com/@jylups/flowable-bpmn-js/dist/assets/bpmn-js.css">
<link rel="stylesheet" href="https://unpkg.com/@jylups/flowable-bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css">
<link rel="stylesheet" href="https://unpkg.com/@jylups/flowable-bpmn-js/dist/assets/properties-panel.css">
<link rel="stylesheet" href="https://unpkg.com/@jylups/flowable-bpmn-js/dist/assets/bpmn-js-bpmnlint.css">
<link rel="stylesheet" href="https://unpkg.com/@jylups/flowable-bpmn-js/dist/assets/flowable-bpmn-js.css">
<link rel="stylesheet" href="https://unpkg.com/@jylups/flowable-bpmn-js/dist/assets/flowable-bpmn-js-touch.css">
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
npm run icons         # regenerates assets/flowable-bpmn-js.css from the icons (lint checks it)
npm run all           # everything above, as CI and the release workflow run it
```

The tests run in headless Chromium through Playwright. Either install Playwright's Chromium once with `npx playwright install chromium`, or use an installed Google Chrome with `TEST_BROWSER_CHANNEL=chrome npm test`.

## License

MIT
