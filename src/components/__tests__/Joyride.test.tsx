import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import Joyride from '../index';
import { ACTIONS, EVENTS, STATUS } from '~/literals';

describe('Joyride', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <Joyride
        steps={[{ target: '.test', content: 'Test step' }]}
        run={false}
      />,
    );
    expect(container.querySelector('.react-joyride')).toBeInTheDocument();
  });

  it('does not render steps when run is false', () => {
    const { container } = render(
      <Joyride
        steps={[{ target: '.test', content: 'Test step' }]}
        run={false}
      />,
    );
    expect(container.querySelector('.react-joyride__step')).not.toBeInTheDocument();
  });

  it('fires TOUR_START callback when run', () => {
    const target = document.createElement('div');
    target.className = 'test-target';
    document.body.appendChild(target);

    const callback = vi.fn();
    render(
      <Joyride
        steps={[{ target: '.test-target', content: 'Step 1' }]}
        run={true}
        callback={callback}
      />,
    );

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        type: EVENTS.TOUR_START,
      }),
    );

    document.body.removeChild(target);
  });

  it('provides helpers via getHelpers', () => {
    let receivedHelpers: any = null;
    render(
      <Joyride
        steps={[{ target: '.test', content: 'Test' }]}
        run={false}
        getHelpers={(helpers) => {
          receivedHelpers = helpers;
        }}
      />,
    );

    expect(receivedHelpers).not.toBeNull();
    expect(typeof receivedHelpers.next).toBe('function');
    expect(typeof receivedHelpers.prev).toBe('function');
    expect(typeof receivedHelpers.close).toBe('function');
    expect(typeof receivedHelpers.skip).toBe('function');
    expect(typeof receivedHelpers.go).toBe('function');
    expect(typeof receivedHelpers.info).toBe('function');
  });

  it('fires TARGET_NOT_FOUND when target does not exist', () => {
    const callback = vi.fn();
    render(
      <Joyride
        steps={[{ target: '.nonexistent', content: 'Missing' }]}
        run={true}
        callback={callback}
      />,
    );

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        type: EVENTS.TARGET_NOT_FOUND,
      }),
    );
  });

  it('accepts an empty steps array', () => {
    const { container } = render(
      <Joyride steps={[]} run={true} />,
    );
    expect(container.querySelector('.react-joyride')).toBeInTheDocument();
  });
});
