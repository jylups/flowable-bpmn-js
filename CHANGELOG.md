# Changelog

All notable changes to this package are documented here.

## Unreleased

* `DOCS`: add the integration guide for apps (Vite, styles, panel container, `.bpmn` and `.bpmn20.xml` files), and build the distro before packing ([jylups/bpmn-js-env#46](https://github.com/jylups/bpmn-js-env/issues/46))
* `FEAT`: open new diagrams as executable Flowable processes (`createDiagram`, `createNewDiagramXML`), and add theme hooks: CSS custom properties for shape, label and watermark colors ([jylups/bpmn-js-env#45](https://github.com/jylups/bpmn-js-env/issues/45))
* `FEAT`: lint with Flowable rules (service task implementation, valid durations, called element) in the modeler, with bpmn-js-bpmnlint ([jylups/bpmn-js-env#44](https://github.com/jylups/bpmn-js-env/issues/44))
* `FEAT`: add the optional `TouchModule` for touch editing and its stylesheet, from bpmn-js-touch-interaction as adapted in `@jylups/cmmn-js` ([jylups/bpmn-js-env#43](https://github.com/jylups/bpmn-js-env/issues/43))
* `FEAT`: draw the typed service tasks with original icons on the canvas, in the palette and in the replace menu ([jylups/bpmn-js-env#42](https://github.com/jylups/bpmn-js-env/issues/42))
* `FEAT`: add palette and replace menu entries for the typed service tasks ([jylups/bpmn-js-env#41](https://github.com/jylups/bpmn-js-env/issues/41))
* `FEAT`: add the `Modeler`, `Viewer` and `NavigatedViewer` entry points with the Flowable descriptor, behaviors and properties panel, the `FlowableXMLModule`, typings, and a browser distro ([jylups/bpmn-js-env#40](https://github.com/jylups/bpmn-js-env/issues/40))
* `CHORE`: add the package scaffold: ESM package, lint and Vitest setup ([jylups/bpmn-js-env#3](https://github.com/jylups/bpmn-js-env/issues/3))
