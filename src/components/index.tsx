import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import isEqual from '@gilbarbara/deep-equal';
import is from 'is-lite';
import treeChanges from 'tree-changes';

import {
  canUseDOM,
  getElement,
  getScrollParent,
  getScrollTo,
  hasCustomScrollParent,
  scrollTo,
} from '~/modules/dom';
import { log, shouldScroll } from '~/modules/helpers';
import { getMergedStep, validateSteps } from '~/modules/step';
import createStore from '~/modules/store';

import { ACTIONS, EVENTS, LIFECYCLE, STATUS } from '~/literals';

import Overlay from '~/components/Overlay';
import Portal from '~/components/Portal';

import { Actions, CallBackProps, Props, State, Status, StoreHelpers } from '~/types';

import Step from './Step';

const defaultPropsValues = {
  continuous: false,
  debug: false,
  disableCloseOnEsc: false,
  disableOverlay: false,
  disableOverlayClose: false,
  disableScrolling: false,
  disableScrollParentFix: false,
  hideBackButton: false,
  run: true,
  scrollOffset: 20,
  scrollDuration: 300,
  scrollToFirstStep: false,
  showSkipButton: false,
  showProgress: false,
  spotlightClicks: false,
  spotlightPadding: 10,
  steps: [],
};

function Joyride(inputProps: Props) {
  const props = { ...defaultPropsValues, ...inputProps };
  const {
    callback: callbackProp,
    continuous,
    debug,
    disableCloseOnEsc,
    getHelpers,
    nonce,
    run,
    scrollDuration,
    scrollOffset,
    scrollToFirstStep,
    stepIndex,
    steps,
  } = props;

  const storeRef = useRef(
    createStore({
      ...props,
      controlled: run && is.number(stepIndex),
    }),
  );
  const helpersRef = useRef<StoreHelpers>(storeRef.current.getHelpers());
  const [state, setState] = useState<State>(storeRef.current.getState());
  const previousStateRef = useRef<State>(state);
  const previousPropsRef = useRef(props);
  const mountedRef = useRef(false);

  const store = storeRef.current;
  const helpers = helpersRef.current;

  const triggerCallback = useCallback(
    (data: CallBackProps) => {
      if (is.function(callbackProp)) {
        callbackProp(data);
      }
    },
    [callbackProp],
  );

  const handleKeyboard = useCallback(
    (event: KeyboardEvent) => {
      const { index: currentIndex, lifecycle } = storeRef.current.getState();
      const currentSteps = props.steps;
      const currentStep = currentSteps[currentIndex];

      if (lifecycle === LIFECYCLE.TOOLTIP) {
        if (event.code === 'Escape' && currentStep && !currentStep.disableCloseOnEsc) {
          storeRef.current.close('keyboard');
        }
      }
    },
    [props.steps],
  );

  const handleClickOverlay = useCallback(() => {
    const currentState = storeRef.current.getState();
    const step = getMergedStep(props, steps[currentState.index]);

    if (!step.disableOverlayClose) {
      helpers.close('overlay');
    }
  }, [props, steps, helpers]);

  // Set up store listener and keyboard handler
  useEffect(() => {
    store.addListener(setState);

    log({
      title: 'init',
      data: [
        { key: 'props', value: props },
        { key: 'state', value: state },
      ],
      debug,
    });

    if (getHelpers) {
      getHelpers(helpers);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Mount effect - start tour and add keyboard listener
  useEffect(() => {
    if (!canUseDOM()) {
      return;
    }

    if (validateSteps(steps, debug) && run) {
      store.start();
    }

    if (!disableCloseOnEsc) {
      document.body.addEventListener('keydown', handleKeyboard, { passive: true });
    }

    mountedRef.current = true;

    return () => {
      if (!disableCloseOnEsc) {
        document.body.removeEventListener('keydown', handleKeyboard);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // componentDidUpdate for props changes
  useEffect(() => {
    if (!mountedRef.current || !canUseDOM()) {
      return;
    }

    const previousProps = previousPropsRef.current;
    const { changedProps } = treeChanges(previousProps, props) as any;
    const changedPropsFn = (key: string) => {
      const prev = (previousProps as any)[key];
      const curr = (props as any)[key];
      return prev !== curr;
    };

    const stepsChanged = !isEqual(previousProps.steps, steps);

    if (stepsChanged) {
      if (validateSteps(steps, debug)) {
        store.setSteps(steps);
      } else {
        // eslint-disable-next-line no-console
        console.warn('Steps are not valid', steps);
      }
    }

    if (changedPropsFn('run')) {
      if (run) {
        store.start(stepIndex);
      } else {
        store.stop();
      }
    }

    const stepIndexChanged = is.number(stepIndex) && changedPropsFn('stepIndex');

    if (stepIndexChanged) {
      const currentState = store.getState();
      let nextAction: Actions =
        is.number(previousProps.stepIndex) && previousProps.stepIndex < stepIndex!
          ? ACTIONS.NEXT
          : ACTIONS.PREV;

      if (currentState.action === ACTIONS.STOP) {
        nextAction = ACTIONS.START;
      }

      if (!([STATUS.FINISHED, STATUS.SKIPPED] as Array<Status>).includes(currentState.status)) {
        store.update({
          action: currentState.action === ACTIONS.CLOSE ? ACTIONS.CLOSE : nextAction,
          index: stepIndex,
          lifecycle: LIFECYCLE.INIT,
        });
      }
    }

    previousPropsRef.current = props;
  });

  // componentDidUpdate for state changes
  useEffect(() => {
    if (!mountedRef.current || !canUseDOM()) {
      return;
    }

    const previousState = previousStateRef.current;
    const { action, controlled, index, lifecycle, status } = state;
    const { changed, changedFrom } = treeChanges(previousState, state);
    const step = getMergedStep(props, steps[index]);
    const target = getElement(step.target);

    // Update the index if the first step is not found
    if (!controlled && status === STATUS.RUNNING && index === 0 && !target) {
      store.update({ index: index + 1 });
      triggerCallback({
        ...state,
        type: EVENTS.TARGET_NOT_FOUND,
        step,
      });
    }

    const callbackData = {
      ...state,
      index,
      step,
    };
    const isAfterAction = changed('action', [
      ACTIONS.NEXT,
      ACTIONS.PREV,
      ACTIONS.SKIP,
      ACTIONS.CLOSE,
    ]);

    if (isAfterAction && changed('status', STATUS.PAUSED)) {
      const previousStep = getMergedStep(props, steps[previousState.index]);

      triggerCallback({
        ...callbackData,
        index: previousState.index,
        lifecycle: LIFECYCLE.COMPLETE,
        step: previousStep,
        type: EVENTS.STEP_AFTER,
      });
    }

    if (changed('status', [STATUS.FINISHED, STATUS.SKIPPED])) {
      const previousStep = getMergedStep(props, steps[previousState.index]);

      if (!controlled) {
        triggerCallback({
          ...callbackData,
          index: previousState.index,
          lifecycle: LIFECYCLE.COMPLETE,
          step: previousStep,
          type: EVENTS.STEP_AFTER,
        });
      }

      triggerCallback({
        ...callbackData,
        type: EVENTS.TOUR_END,
        // Return the last step when the tour is finished
        step: previousStep,
        index: previousState.index,
      });
      store.reset();
    } else if (changedFrom('status', [STATUS.IDLE, STATUS.READY], STATUS.RUNNING)) {
      triggerCallback({
        ...callbackData,
        type: EVENTS.TOUR_START,
      });
    } else if (changed('status') || changed('action', ACTIONS.RESET)) {
      triggerCallback({
        ...callbackData,
        type: EVENTS.TOUR_STATUS,
      });
    }

    // Scroll to step
    scrollToStep(previousState);

    previousStateRef.current = state;
  });

  function scrollToStep(previousState: State) {
    const { index, lifecycle, status } = state;
    const {
      disableScrollParentFix = false,
    } = props;
    const step = getMergedStep(props, steps[index]);

    const target = getElement(step.target);
    const shouldScrollToStep = shouldScroll({
      isFirstStep: index === 0,
      lifecycle,
      previousLifecycle: previousState.lifecycle,
      scrollToFirstStep,
      step,
      target,
    });

    if (status === STATUS.RUNNING && shouldScrollToStep) {
      const hasCustomScroll = hasCustomScrollParent(target, disableScrollParentFix);
      const scrollParent = getScrollParent(target, disableScrollParentFix);
      let scrollY = Math.floor(getScrollTo(target, scrollOffset, disableScrollParentFix)) || 0;

      log({
        title: 'scrollToStep',
        data: [
          { key: 'index', value: index },
          { key: 'lifecycle', value: lifecycle },
          { key: 'status', value: status },
        ],
        debug,
      });

      // Adjust for spotlight padding
      scrollY -= step.spotlightPadding;
      scrollY = scrollY >= 0 ? scrollY : 0;

      if (status === STATUS.RUNNING) {
        scrollTo(scrollY, { element: scrollParent as Element, duration: scrollDuration });
      }
    }
  }

  if (!canUseDOM()) {
    return null;
  }

  const { index, lifecycle, status } = state;
  const isRunning = status === STATUS.RUNNING;
  const content: Record<string, ReactNode> = {};

  if (isRunning && steps[index]) {
    const step = getMergedStep(props, steps[index]);

    content.step = (
      <Step
        {...state}
        callback={triggerCallback}
        continuous={continuous}
        debug={debug}
        helpers={helpers}
        nonce={nonce}
        shouldScroll={!step.disableScrolling && (index !== 0 || scrollToFirstStep)}
        step={step}
        store={store}
      />
    );

    content.overlay = (
      <Portal id="react-joyride-portal">
        <Overlay
          {...step}
          continuous={continuous}
          debug={debug}
          lifecycle={lifecycle}
          onClickOverlay={handleClickOverlay}
        />
      </Portal>
    );
  }

  return (
    <div className="react-joyride">
      {content.step}
      {content.overlay}
    </div>
  );
}

export default Joyride;
