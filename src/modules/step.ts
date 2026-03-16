import deepmerge from 'deepmerge';
import is from 'is-lite';

import { defaultLocale, defaultStep } from '~/defaults';
import getStyles from '~/styles';
import { Props, Step, StepMerged } from '~/types';

import { log, pick } from './helpers';

function getTourProps(props: Props) {
  return pick(
    props,
    'beaconComponent',
    'disableCloseOnEsc',
    'disableOverlay',
    'disableOverlayClose',
    'disableScrolling',
    'disableScrollParentFix',
    'hideBackButton',
    'hideCloseButton',
    'locale',
    'showProgress',
    'showSkipButton',
    'spotlightClicks',
    'spotlightPadding',
    'styles',
    'tooltipComponent',
  );
}

export function getMergedStep(props: Props, currentStep?: Step): StepMerged {
  const step = currentStep ?? {};
  const mergedStep = deepmerge.all([defaultStep, getTourProps(props), step], {
    isMergeableObject: is.plainObject,
  }) as StepMerged;

  const mergedStyles = getStyles(props, mergedStep);

  return {
    ...mergedStep,
    locale: deepmerge.all([defaultLocale, props.locale ?? {}, mergedStep.locale || {}]),
    styles: mergedStyles,
  };
}

/**
 * Validate if a step is valid
 */
export function validateStep(step: Step, debug: boolean = false): boolean {
  if (!is.plainObject(step)) {
    log({
      title: 'validateStep',
      data: 'step must be an object',
      warn: true,
      debug,
    });

    return false;
  }

  if (!step.target) {
    log({
      title: 'validateStep',
      data: 'target is missing from the step',
      warn: true,
      debug,
    });

    return false;
  }

  return true;
}

/**
 * Validate if steps are valid
 */
export function validateSteps(steps: Array<Step>, debug: boolean = false): boolean {
  if (!is.array(steps)) {
    log({
      title: 'validateSteps',
      data: 'steps must be an array',
      warn: true,
      debug,
    });

    return false;
  }

  return steps.every(d => validateStep(d, debug));
}
