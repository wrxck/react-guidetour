import { useCallback, useEffect, useRef } from 'react';
import {
  useFloating,
  autoUpdate,
  flip,
  shift,
  offset as offsetMiddleware,
  arrow as arrowMiddleware,
  Placement,
} from '@floating-ui/react';
import is from 'is-lite';
import treeChanges from 'tree-changes';

import { getElement, isElementVisible } from '~/modules/dom';
import { hideBeacon, log } from '~/modules/helpers';
import Scope from '~/modules/scope';
import { validateStep } from '~/modules/step';

import { ACTIONS, EVENTS, LIFECYCLE, STATUS } from '~/literals';

import { StepProps } from '~/types';

import Beacon from './Beacon';
import Tooltip from './Tooltip/index';

const ARROW_SIZE = 10;

export default function JoyrideStep(props: StepProps) {
  const {
    action,
    callback,
    continuous,
    controlled,
    debug,
    helpers,
    index,
    lifecycle,
    nonce,
    shouldScroll,
    size,
    status,
    step,
    store,
  } = props;

  const scopeRef = useRef<Scope | null>(null);
  const tooltipRef = useRef<HTMLElement | null>(null);
  const previousPropsRef = useRef(props);
  const arrowRef = useRef<HTMLDivElement | null>(null);

  const setTooltipRef = useCallback((element: HTMLElement) => {
    tooltipRef.current = element;
  }, []);

  const handleClickHoverBeacon = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (event.type === 'mouseenter' && step.event !== 'hover') {
        return;
      }

      store.update({ lifecycle: LIFECYCLE.TOOLTIP });
    },
    [step.event, store],
  );

  const target = getElement(step.target);
  const isOpen = hideBeacon(step) || lifecycle === LIFECYCLE.TOOLTIP;
  const isCentered = step.placement === 'center';

  const floatingPlacement: Placement =
    isCentered || step.placement === 'auto' ? 'bottom' : (step.placement as Placement);

  const totalOffset = isOpen
    ? step.offset + (step.spotlightPadding ?? 0)
    : step.offset;

  const {
    refs,
    floatingStyles,
    middlewareData,
    placement: computedPlacement,
  } = useFloating({
    placement: floatingPlacement,
    elements: {
      reference: target,
    },
    middleware: [
      offsetMiddleware(totalOffset),
      flip(),
      shift({ padding: 5 }),
      arrowMiddleware({ element: arrowRef }),
    ],
    whileElementsMounted: autoUpdate,
  });

  // Log on mount
  useEffect(() => {
    log({
      title: `step:${index}`,
      data: [{ key: 'props', value: props }],
      debug,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup scope on unmount
  useEffect(() => {
    return () => {
      scopeRef.current?.removeScope();
    };
  }, []);

  // Trigger READY when target is available (replaces setPopper/getPopper callback)
  useEffect(() => {
    if (target && lifecycle === LIFECYCLE.INIT) {
      store.update({
        action,
        lifecycle: LIFECYCLE.READY,
      });
    }
  }, [target, lifecycle, action, store]);

  // componentDidUpdate equivalent
  useEffect(() => {
    const previousProps = previousPropsRef.current;
    const { changed, changedFrom } = treeChanges(previousProps, props);
    const state = helpers.info();

    const skipBeacon =
      continuous && action !== ACTIONS.CLOSE && (index > 0 || action === ACTIONS.PREV);
    const hasStoreChanged =
      changed('action') || changed('index') || changed('lifecycle') || changed('status');
    const isInitial = changedFrom('lifecycle', [LIFECYCLE.TOOLTIP, LIFECYCLE.INIT], LIFECYCLE.INIT);
    const isAfterAction = changed('action', [
      ACTIONS.NEXT,
      ACTIONS.PREV,
      ACTIONS.SKIP,
      ACTIONS.CLOSE,
    ]);
    const isControlled = controlled && index === previousProps.index;

    if (isAfterAction && (isInitial || isControlled)) {
      callback({
        ...state,
        index: previousProps.index,
        lifecycle: LIFECYCLE.COMPLETE,
        step: previousProps.step,
        type: EVENTS.STEP_AFTER,
      });
    }

    if (
      step.placement === 'center' &&
      status === STATUS.RUNNING &&
      changed('index') &&
      action !== ACTIONS.START &&
      lifecycle === LIFECYCLE.INIT
    ) {
      store.update({ lifecycle: LIFECYCLE.READY });
    }

    if (hasStoreChanged) {
      const element = getElement(step.target);
      const elementExists = !!element;
      const hasRenderedTarget = elementExists && isElementVisible(element);

      if (hasRenderedTarget) {
        if (
          changedFrom('status', STATUS.READY, STATUS.RUNNING) ||
          changedFrom('lifecycle', LIFECYCLE.INIT, LIFECYCLE.READY)
        ) {
          callback({
            ...state,
            step,
            type: EVENTS.STEP_BEFORE,
          });
        }
      } else {
        // eslint-disable-next-line no-console
        console.warn(elementExists ? 'Target not visible' : 'Target not mounted', step);
        callback({
          ...state,
          type: EVENTS.TARGET_NOT_FOUND,
          step,
        });

        if (!controlled) {
          store.update({ index: index + (action === ACTIONS.PREV ? -1 : 1) });
        }
      }
    }

    if (changedFrom('lifecycle', LIFECYCLE.INIT, LIFECYCLE.READY)) {
      store.update({
        lifecycle: hideBeacon(step) || skipBeacon ? LIFECYCLE.TOOLTIP : LIFECYCLE.BEACON,
      });
    }

    if (changed('index')) {
      log({
        title: `step:${lifecycle}`,
        data: [{ key: 'props', value: props }],
        debug,
      });
    }

    if (changed('lifecycle', LIFECYCLE.BEACON)) {
      callback({
        ...state,
        step,
        type: EVENTS.BEACON,
      });
    }

    if (changed('lifecycle', LIFECYCLE.TOOLTIP)) {
      callback({
        ...state,
        step,
        type: EVENTS.TOOLTIP,
      });

      if (shouldScroll && tooltipRef.current) {
        scopeRef.current = new Scope(tooltipRef.current, { selector: '[data-action=primary]' });
        scopeRef.current.setFocus();
      }
    }

    if (changedFrom('lifecycle', [LIFECYCLE.TOOLTIP, LIFECYCLE.INIT], LIFECYCLE.INIT)) {
      scopeRef.current?.removeScope();
    }

    previousPropsRef.current = props;
  });

  if (!validateStep(step) || !is.domElement(target)) {
    return null;
  }

  const zIndex = (step.styles.options.zIndex ?? 100) + 100;
  const arrowColor = step.styles.options.arrowColor ?? '#fff';

  // Center placement: render tooltip fixed in viewport center
  if (isCentered && isOpen) {
    return (
      <div key={`JoyrideStep-${index}`} className="react-joyride__step">
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex,
          }}
        >
          <Tooltip
            continuous={continuous}
            helpers={helpers}
            index={index}
            isLastStep={index + 1 === size}
            setTooltipRef={setTooltipRef}
            size={size}
            step={step}
          />
        </div>
      </div>
    );
  }

  if (isCentered) {
    return null;
  }

  // Compute arrow styles for tooltip
  const arrowSide = computedPlacement.split('-')[0];
  const staticSide = ({ top: 'bottom', right: 'left', bottom: 'top', left: 'right' } as const)[
    arrowSide as 'top' | 'right' | 'bottom' | 'left'
  ]!;
  const arrowStyles: React.CSSProperties = {
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid',
    pointerEvents: 'none',
    ...(middlewareData.arrow?.x != null ? { left: middlewareData.arrow.x } : {}),
    ...(middlewareData.arrow?.y != null ? { top: middlewareData.arrow.y } : {}),
    [staticSide]: -ARROW_SIZE,
  };

  switch (arrowSide) {
    case 'top':
      arrowStyles.borderWidth = `${ARROW_SIZE}px ${ARROW_SIZE}px 0`;
      arrowStyles.borderColor = `${arrowColor} transparent transparent`;
      break;
    case 'bottom':
      arrowStyles.borderWidth = `0 ${ARROW_SIZE}px ${ARROW_SIZE}px`;
      arrowStyles.borderColor = `transparent transparent ${arrowColor}`;
      break;
    case 'left':
      arrowStyles.borderWidth = `${ARROW_SIZE}px 0 ${ARROW_SIZE}px ${ARROW_SIZE}px`;
      arrowStyles.borderColor = `transparent transparent transparent ${arrowColor}`;
      break;
    case 'right':
      arrowStyles.borderWidth = `${ARROW_SIZE}px ${ARROW_SIZE}px ${ARROW_SIZE}px 0`;
      arrowStyles.borderColor = `transparent ${arrowColor} transparent transparent`;
      break;
  }

  return (
    <div key={`JoyrideStep-${index}`} className="react-joyride__step">
      {!isOpen && (
        <div ref={refs.setFloating} style={floatingStyles}>
          <Beacon
            beaconComponent={step.beaconComponent}
            continuous={continuous}
            index={index}
            isLastStep={index + 1 === size}
            locale={step.locale}
            nonce={nonce}
            onClickOrHover={handleClickHoverBeacon}
            shouldFocus={shouldScroll}
            size={size}
            step={step}
            styles={step.styles}
          />
        </div>
      )}
      {isOpen && (
        <div
          ref={refs.setFloating}
          style={{
            ...floatingStyles,
            zIndex,
          }}
        >
          <Tooltip
            continuous={continuous}
            helpers={helpers}
            index={index}
            isLastStep={index + 1 === size}
            setTooltipRef={setTooltipRef}
            size={size}
            step={step}
          />
          <div ref={arrowRef} style={arrowStyles} />
        </div>
      )}
    </div>
  );
}
