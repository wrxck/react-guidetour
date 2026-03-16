import { cloneElement, FC, isValidElement, ReactElement, ReactNode } from 'react';
import innerText from 'react-innertext';
import is from 'is-lite';

import { LIFECYCLE } from '~/literals';

import { AnyObject, Lifecycle, NarrowPlainObject, Step } from '~/types';

import { hasPosition } from './dom';

interface GetReactNodeTextOptions {
  defaultValue?: any;
  step?: number;
  steps?: number;
}

interface LogOptions {
  /** The data to be logged */
  data: any;
  /** display the log */
  debug?: boolean;
  /** The title the logger was called from */
  title: string;
  /** If true, the message will be a warning */
  warn?: boolean;
}

interface ShouldScrollOptions {
  isFirstStep: boolean;
  lifecycle: Lifecycle;
  previousLifecycle: Lifecycle;
  scrollToFirstStep: boolean;
  step: Step;
  target: HTMLElement | null;
}

/**
 * Detect Safari browser (used for mix-blend-mode workaround)
 */
export function isSafari(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  return /(Version\/([\d._]+).*Safari|CriOS|FxiOS| Mobile\/)/.test(navigator.userAgent);
}

/**
 * Get Object type
 */
export function getObjectType(value: unknown): string {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}

export function getReactNodeText(input: ReactNode, options: GetReactNodeTextOptions = {}): string {
  const { defaultValue, step, steps } = options;
  let text = innerText(input);

  if (!text) {
    if (
      isValidElement(input) &&
      !Object.values((input as any).props).length &&
      getObjectType(input.type) === 'function'
    ) {
      const component = (input.type as FC)({});

      text = getReactNodeText(component as ReactNode, options);
    } else {
      text = innerText(defaultValue);
    }
  } else if ((text.includes('{step}') || text.includes('{steps}')) && step && steps) {
    text = text.replace('{step}', step.toString()).replace('{steps}', steps.toString());
  }

  return text;
}

export function hasValidKeys(object: Record<string, unknown>, keys?: Array<string>): boolean {
  if (!is.plainObject(object) || !is.array(keys)) {
    return false;
  }

  return Object.keys(object).every(d => keys.includes(d));
}

/**
 * Convert hex to RGB
 */
export function hexToRGB(hex: string): Array<number> {
  const shorthandRegex = /^#?([\da-f])([\da-f])([\da-f])$/i;
  const properHex = hex.replace(shorthandRegex, (_m, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(properHex);

  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [];
}

/**
 * Decide if the step shouldn't skip the beacon
 */
export function hideBeacon(step: Step): boolean {
  return step.disableBeacon || step.placement === 'center';
}

/**
 * Log method calls if debug is enabled
 */
export function log({ data, debug = false, title, warn = false }: LogOptions) {
  /* eslint-disable no-console */
  const logFn = warn ? console.warn || console.error : console.log;

  if (debug) {
    if (title && data) {
      console.groupCollapsed(
        `%creact-guidetour: ${title}`,
        'color: #ff0044; font-weight: bold; font-size: 12px;',
      );

      if (Array.isArray(data)) {
        data.forEach(d => {
          if (is.plainObject(d) && d.key) {
            logFn.apply(console, [d.key, d.value]);
          } else {
            logFn.apply(console, [d]);
          }
        });
      } else {
        logFn.apply(console, [data]);
      }

      console.groupEnd();
    } else {
      console.error('Missing title or data props');
    }
  }
  /* eslint-enable */
}

/**
 * A function that does nothing.
 */
export function noop() {
  return undefined;
}

/**
 * Type-safe Object.keys()
 */
export function objectKeys<T extends AnyObject>(input: T) {
  return Object.keys(input) as Array<keyof T>;
}

/**
 * Remove properties from an object
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  input: NarrowPlainObject<T>,
  ...filter: K[]
) {
  if (!is.plainObject(input)) {
    throw new TypeError('Expected an object');
  }

  const output: any = {};

  for (const key in input) {
    /* istanbul ignore else */
    if ({}.hasOwnProperty.call(input, key)) {
      if (!filter.includes(key as unknown as K)) {
        output[key] = input[key];
      }
    }
  }

  return output as Omit<T, K>;
}

/**
 * Select properties from an object
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  input: NarrowPlainObject<T>,
  ...filter: K[]
) {
  if (!is.plainObject(input)) {
    throw new TypeError('Expected an object');
  }

  if (!filter.length) {
    return input;
  }

  const output: any = {};

  for (const key in input) {
    /* istanbul ignore else */
    if ({}.hasOwnProperty.call(input, key)) {
      if (filter.includes(key as unknown as K)) {
        output[key] = input[key];
      }
    }
  }

  return output as Pick<T, K>;
}

export function replaceLocaleContent(input: ReactNode, step: number, steps: number): ReactNode {
  const replacer = (text: string) =>
    text.replace('{step}', String(step)).replace('{steps}', String(steps));

  if (getObjectType(input) === 'string') {
    return replacer(input as string);
  }

  if (!isValidElement(input)) {
    return input;
  }

  const { children } = (input as any).props;

  if (getObjectType(children) === 'string' && children.includes('{step}')) {
    return cloneElement(input as ReactElement<any>, {
      children: replacer(children),
    });
  }

  if (Array.isArray(children)) {
    return cloneElement(input as ReactElement<any>, {
      children: children.map((child: ReactNode) => {
        if (typeof child === 'string') {
          return replacer(child);
        }

        return replaceLocaleContent(child, step, steps);
      }),
    });
  }

  if (getObjectType(input.type) === 'function' && !Object.values((input as any).props).length) {
    const component = (input.type as FC)({});

    return replaceLocaleContent(component as ReactNode, step, steps);
  }

  return input;
}

export function shouldScroll(options: ShouldScrollOptions): boolean {
  const { isFirstStep, lifecycle, previousLifecycle, scrollToFirstStep, step, target } = options;

  return (
    !step.disableScrolling &&
    (!isFirstStep || scrollToFirstStep || lifecycle === LIFECYCLE.TOOLTIP) &&
    step.placement !== 'center' &&
    (!step.isFixed || !hasPosition(target)) && // fixed steps don't need to scroll
    previousLifecycle !== lifecycle &&
    ([LIFECYCLE.BEACON, LIFECYCLE.TOOLTIP] as Array<Lifecycle>).includes(lifecycle)
  );
}

/**
 * Block execution
 */
export function sleep(seconds = 1) {
  return new Promise(resolve => {
    setTimeout(resolve, seconds * 1000);
  });
}
