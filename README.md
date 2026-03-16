# @wrxck/react-guidetour

React 19 guided tour component. A modernised fork of [react-joyride](https://github.com/gilbarbara/react-joyride) by Gil Barbara.

## Why this fork?

react-joyride v2.9.3 uses `ReactDOM.unmountComponentAtNode()` and `ReactDOM.unstable_renderSubtreeIntoContainer()`, both removed in React 19. This fork:

- Converts all class components to functional components with hooks
- Uses `createPortal` directly (no legacy React 15/16 branching)
- Removes legacy browser detection (IE/Edge legacy)
- Targets React 19+ only

## Install

```bash
npm install @wrxck/react-guidetour
```

## Usage

The API is the same as react-joyride. See the [react-joyride documentation](https://docs.react-joyride.com/) for full usage details.

```tsx
import Joyride from '@wrxck/react-guidetour';

const steps = [
  {
    target: '.my-first-step',
    content: 'This is my first step!',
  },
];

function App() {
  return <Joyride steps={steps} />;
}
```

## Attribution

Original work by [Gil Barbara](https://github.com/gilbarbara) under the MIT License.
