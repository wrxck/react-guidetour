import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Overlay from '../Overlay';
import { LIFECYCLE } from '~/literals';

const defaultStyles = {
  overlay: { backgroundColor: 'rgba(0,0,0,0.5)' },
  spotlight: { borderRadius: 4 },
} as any;

const baseProps = {
  content: 'Test',
  target: '.test-target',
  continuous: true,
  debug: false,
  disableBeacon: false,
  disableCloseOnEsc: false,
  disableOverlay: false,
  disableOverlayClose: false,
  disableScrollParentFix: false,
  disableScrolling: false,
  event: 'click' as const,
  hideBackButton: false,
  hideCloseButton: false,
  hideFooter: false,
  isFixed: false,
  lifecycle: LIFECYCLE.TOOLTIP,
  locale: {},
  offset: 10,
  onClickOverlay: vi.fn(),
  placement: 'bottom' as const,
  showProgress: false,
  showSkipButton: false,
  spotlightClicks: false,
  spotlightPadding: 10,
  styles: defaultStyles,
} as any;

describe('Overlay', () => {
  let targetEl: HTMLDivElement;

  beforeEach(() => {
    targetEl = document.createElement('div');
    targetEl.className = 'test-target';
    document.body.appendChild(targetEl);
  });

  afterEach(() => {
    document.body.removeChild(targetEl);
  });

  it('renders overlay with spotlight', () => {
    const { container } = render(<Overlay {...baseProps} />);
    const overlay = container.querySelector('.react-joyride__overlay');
    expect(overlay).toBeInTheDocument();
  });

  it('renders spotlight element', () => {
    const { container } = render(<Overlay {...baseProps} />);
    const spotlight = container.querySelector('.react-joyride__spotlight');
    expect(spotlight).toBeInTheDocument();
  });

  it('does not render when disableOverlay is true', () => {
    const { container } = render(<Overlay {...baseProps} disableOverlay={true} />);
    expect(container.querySelector('.react-joyride__overlay')).not.toBeInTheDocument();
  });

  it('does not render during INIT lifecycle', () => {
    const { container } = render(<Overlay {...baseProps} lifecycle={LIFECYCLE.INIT} />);
    expect(container.querySelector('.react-joyride__overlay')).not.toBeInTheDocument();
  });

  it('calls onClickOverlay when overlay is clicked', () => {
    const onClick = vi.fn();
    const { container } = render(<Overlay {...baseProps} onClickOverlay={onClick} />);
    const overlay = container.querySelector('.react-joyride__overlay');
    fireEvent.click(overlay!);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not render spotlight for center placement', () => {
    const { container } = render(<Overlay {...baseProps} placement="center" />);
    const spotlight = container.querySelector('.react-joyride__spotlight');
    expect(spotlight).not.toBeInTheDocument();
  });
});
