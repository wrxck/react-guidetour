import { useState } from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import Portal from '../Portal';

// Wrapper that triggers a re-render so Portal can mount its portal node
// (Portal returns null on first render since the ref isn't set yet)
function PortalWrapper({ id, children }: { id: string; children: React.ReactElement }) {
  const [, setTick] = useState(0);
  return (
    <>
      <button onClick={() => setTick(t => t + 1)} data-testid="rerender">
        rerender
      </button>
      <Portal id={id}>{children}</Portal>
    </>
  );
}

describe('Portal', () => {
  afterEach(() => {
    const node = document.getElementById('test-portal');
    if (node) {
      document.body.removeChild(node);
    }
  });

  it('creates a portal node in document.body', () => {
    render(
      <Portal id="test-portal">
        <div>Content</div>
      </Portal>,
    );

    const portalNode = document.getElementById('test-portal');
    expect(portalNode).toBeInTheDocument();
    expect(portalNode?.parentNode).toBe(document.body);
  });

  it('renders children inside the portal after re-render', () => {
    const { getByTestId } = render(
      <PortalWrapper id="test-portal">
        <div data-testid="portal-child">Content</div>
      </PortalWrapper>,
    );

    // Trigger re-render so Portal can use the ref
    act(() => {
      getByTestId('rerender').click();
    });

    const portalNode = document.getElementById('test-portal');
    const child = portalNode?.querySelector('[data-testid="portal-child"]');
    expect(child).toBeInTheDocument();
    expect(child?.textContent).toBe('Content');
  });

  it('removes portal node on unmount', () => {
    const { unmount } = render(
      <Portal id="test-portal">
        <div>Content</div>
      </Portal>,
    );

    expect(document.getElementById('test-portal')).toBeInTheDocument();

    unmount();

    expect(document.getElementById('test-portal')).not.toBeInTheDocument();
  });
});
