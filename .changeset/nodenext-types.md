---
"yugen-ui": patch
---

Fix types under TypeScript `module: "node16"` / `"nodenext"` (#343): the root declarations pointed at the Chart, AIKit and hooks modules without a `.js` ending, so 72 exports (BarChart, LineChart, StreamingMarkdown, PromptInput, useDisclosure, useHotkeys…) failed with "has no exported member". `MenubarMenu` no longer names `@radix-ui/react-context` in its type, a package yugen-ui does not depend on. CI now type-checks every export from a `nodenext` project and runs Are the Types Wrong on the package.
