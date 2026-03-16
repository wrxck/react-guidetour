import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Beacon from '../Beacon';
import { defaultLocale } from '~/defaults';

const defaultStyles = {
  beacon: { display: 'inline-block', width: 36, height: 36 },
  beaconInner: { backgroundColor: '#f04' },
  beaconOuter: { border: '2px solid #f04' },
} as any;

const baseStep = {
  target: '.test',
  content: 'Test',
  styles: defaultStyles,
} as any;

const baseProps = {
  continuous: false,
  index: 0,
  isLastStep: false,
  locale: defaultLocale,
  nonce: undefined,
  onClickOrHover: vi.fn(),
  shouldFocus: false,
  size: 3,
  step: baseStep,
  styles: defaultStyles,
};

describe('Beacon', () => {
  it('renders default beacon button', () => {
    render(<Beacon {...baseProps} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('react-joyride__beacon');
  });

  it('has correct aria-label', () => {
    render(<Beacon {...baseProps} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Open the dialog');
  });

  it('calls onClickOrHover on click', () => {
    const onClick = vi.fn();
    render(<Beacon {...baseProps} onClickOrHover={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClickOrHover on mouseenter', () => {
    const onHover = vi.fn();
    render(<Beacon {...baseProps} onClickOrHover={onHover} />);
    fireEvent.mouseEnter(screen.getByRole('button'));
    expect(onHover).toHaveBeenCalledTimes(1);
  });

  it('renders custom beacon component', () => {
    const CustomBeacon = (props: any) => (
      <div data-testid="custom-beacon">Custom</div>
    );
    render(<Beacon {...baseProps} beaconComponent={CustomBeacon} />);
    expect(screen.getByTestId('custom-beacon')).toBeInTheDocument();
  });

  it('renders inner and outer spans', () => {
    const { container } = render(<Beacon {...baseProps} />);
    const spans = container.querySelectorAll('span');
    expect(spans).toHaveLength(2);
  });
});
