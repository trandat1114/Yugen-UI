---
"yugen-ui": minor
---

Components are plain function components that take `ref` as a prop (React 19) instead of `forwardRef` wrappers. Passing a `ref` works as before, and `React.ComponentRef<typeof Button>` and `React.ComponentProps<typeof Button>` still give the element type and the props (with `ref`). In the type declarations each component is now a function such as `Button(props: ButtonProps & { ref?: React.Ref<HTMLButtonElement> })` rather than a `React.ForwardRefExoticComponent`, so code that spelled out `ForwardRefExoticComponent` for a Yugen component should use `typeof Button` or `React.ComponentType<…>`. `DataGrid` and `DataGridColumnPicker` are declared as generic functions directly. Components that keep their own ref next to yours (Carousel, Sheet, Toolbar, FileUpload and others) now call the cleanup function that a callback ref returns when the element is removed (#62).
