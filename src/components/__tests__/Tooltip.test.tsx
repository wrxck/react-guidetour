import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Tooltip from '../Tooltip/index';
import Container from '../Tooltip/Container';
import { defaultLocale } from '~/defaults';

const defaultStyles = {
  tooltip: { backgroundColor: '#fff' },
  tooltipContainer: {},
  tooltipTitle: {},
  tooltipContent: {},
  tooltipFooter: {},
  tooltipFooterSpacer: {},
  buttonNext: {},
  buttonBack: {},
  buttonClose: { color: '#333', height: 14, width: 14 },
  buttonSkip: {},
  options: {},
} as any;

const mockHelpers = {
  close: vi.fn(),
  go: vi.fn(),
  info: vi.fn(),
  next: vi.fn(),
  open: vi.fn(),
  prev: vi.fn(),
  reset: vi.fn(),
  skip: vi.fn(),
};

const baseStep = {
  content: 'Test content',
  target: '.test',
  locale: defaultLocale,
  styles: defaultStyles,
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
  offset: 10,
  placement: 'bottom' as const,
  showProgress: false,
  showSkipButton: false,
  spotlightClicks: false,
  spotlightPadding: 10,
} as any;

const setTooltipRef = vi.fn();

describe('Tooltip', () => {
  it('renders content', () => {
    render(
      <Tooltip
        continuous={true}
        helpers={mockHelpers}
        index={0}
        isLastStep={false}
        setTooltipRef={setTooltipRef}
        size={3}
        step={baseStep}
      />,
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(
      <Tooltip
        continuous={true}
        helpers={mockHelpers}
        index={0}
        isLastStep={false}
        setTooltipRef={setTooltipRef}
        size={3}
        step={{ ...baseStep, title: 'Test Title' }}
      />,
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders Next button in continuous mode', () => {
    render(
      <Tooltip
        continuous={true}
        helpers={mockHelpers}
        index={0}
        isLastStep={false}
        setTooltipRef={setTooltipRef}
        size={3}
        step={baseStep}
      />,
    );

    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('renders Last button on last step', () => {
    render(
      <Tooltip
        continuous={true}
        helpers={mockHelpers}
        index={2}
        isLastStep={true}
        setTooltipRef={setTooltipRef}
        size={3}
        step={baseStep}
      />,
    );

    expect(screen.getByText('Last')).toBeInTheDocument();
  });

  it('calls helpers.next on Next click', () => {
    const helpers = { ...mockHelpers, next: vi.fn() };
    render(
      <Tooltip
        continuous={true}
        helpers={helpers}
        index={0}
        isLastStep={false}
        setTooltipRef={setTooltipRef}
        size={3}
        step={baseStep}
      />,
    );

    fireEvent.click(screen.getByText('Next'));
    expect(helpers.next).toHaveBeenCalled();
  });

  it('shows back button when not first step', () => {
    render(
      <Tooltip
        continuous={true}
        helpers={mockHelpers}
        index={1}
        isLastStep={false}
        setTooltipRef={setTooltipRef}
        size={3}
        step={baseStep}
      />,
    );

    expect(screen.getByText('Back')).toBeInTheDocument();
  });

  it('hides back button on first step', () => {
    render(
      <Tooltip
        continuous={true}
        helpers={mockHelpers}
        index={0}
        isLastStep={false}
        setTooltipRef={setTooltipRef}
        size={3}
        step={baseStep}
      />,
    );

    expect(screen.queryByText('Back')).not.toBeInTheDocument();
  });

  it('shows skip button when enabled', () => {
    render(
      <Tooltip
        continuous={true}
        helpers={mockHelpers}
        index={0}
        isLastStep={false}
        setTooltipRef={setTooltipRef}
        size={3}
        step={{ ...baseStep, showSkipButton: true }}
      />,
    );

    expect(screen.getByText('Skip')).toBeInTheDocument();
  });

  it('hides footer when hideFooter is true', () => {
    const { container } = render(
      <Tooltip
        continuous={true}
        helpers={mockHelpers}
        index={0}
        isLastStep={false}
        setTooltipRef={setTooltipRef}
        size={3}
        step={{ ...baseStep, hideFooter: true }}
      />,
    );

    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });

  it('renders custom tooltip component', () => {
    const CustomTooltip = (props: any) => (
      <div data-testid="custom-tooltip">Custom: {props.step.content}</div>
    );
    render(
      <Tooltip
        continuous={true}
        helpers={mockHelpers}
        index={0}
        isLastStep={false}
        setTooltipRef={setTooltipRef}
        size={3}
        step={{ ...baseStep, tooltipComponent: CustomTooltip }}
      />,
    );

    expect(screen.getByTestId('custom-tooltip')).toBeInTheDocument();
  });
});

describe('Container', () => {
  const baseContainerProps = {
    backProps: {
      'aria-label': 'Back',
      children: 'Back',
      'data-action': 'back',
      onClick: vi.fn(),
      role: 'button',
      title: 'Back',
    },
    closeProps: {
      'aria-label': 'Close',
      children: 'Close',
      'data-action': 'close',
      onClick: vi.fn(),
      role: 'button',
      title: 'Close',
    },
    primaryProps: {
      'aria-label': 'Next',
      children: 'Next',
      'data-action': 'primary',
      onClick: vi.fn(),
      role: 'button',
      title: 'Next',
    },
    skipProps: {
      'aria-label': 'Skip',
      children: 'Skip',
      'data-action': 'skip',
      onClick: vi.fn(),
      role: 'button',
      title: 'Skip',
    },
    tooltipProps: {
      'aria-modal': true,
      ref: vi.fn(),
      role: 'alertdialog',
    },
    continuous: true,
    index: 0,
    isLastStep: false,
    size: 3,
    step: baseStep,
  };

  it('renders with alertdialog role', () => {
    render(<Container {...baseContainerProps} />);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('renders primary button', () => {
    const { container } = render(<Container {...baseContainerProps} />);
    const button = container.querySelector('[data-test-id="button-primary"]');
    expect(button).toBeInTheDocument();
  });
});
