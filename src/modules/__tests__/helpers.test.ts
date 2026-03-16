import { describe, it, expect, vi } from 'vitest';
import {
  hideBeacon,
  isSafari,
  hasValidKeys,
  hexToRGB,
  objectKeys,
  omit,
  pick,
  getObjectType,
  shouldScroll,
  noop,
} from '../helpers';
import { LIFECYCLE } from '~/literals';

describe('helpers', () => {
  describe('hideBeacon', () => {
    it('returns true when disableBeacon is true', () => {
      expect(hideBeacon({ disableBeacon: true, target: '.a', content: 'A' })).toBe(true);
    });

    it('returns true when placement is center', () => {
      expect(hideBeacon({ placement: 'center', target: '.a', content: 'A' })).toBe(true);
    });

    it('returns false when beacon should show', () => {
      expect(hideBeacon({ target: '.a', content: 'A' })).toBe(false);
    });

    it('returns false for non-center placement', () => {
      expect(hideBeacon({ placement: 'top', target: '.a', content: 'A' })).toBe(false);
    });
  });

  describe('isSafari', () => {
    it('returns false in JSDOM (non-Safari)', () => {
      expect(isSafari()).toBe(false);
    });
  });

  describe('hasValidKeys', () => {
    it('returns true when all keys are valid', () => {
      expect(hasValidKeys({ a: 1, b: 2 }, ['a', 'b', 'c'])).toBe(true);
    });

    it('returns false when an invalid key is present', () => {
      expect(hasValidKeys({ a: 1, d: 2 }, ['a', 'b', 'c'])).toBe(false);
    });

    it('returns false for non-object input', () => {
      expect(hasValidKeys(null as any, ['a'])).toBe(false);
    });

    it('returns false when keys is not an array', () => {
      expect(hasValidKeys({ a: 1 }, null as any)).toBe(false);
    });
  });

  describe('hexToRGB', () => {
    it('converts 6-digit hex', () => {
      expect(hexToRGB('#ff0044')).toEqual([255, 0, 68]);
    });

    it('converts 3-digit shorthand hex', () => {
      expect(hexToRGB('#f04')).toEqual([255, 0, 68]);
    });

    it('works without hash prefix', () => {
      expect(hexToRGB('ff0044')).toEqual([255, 0, 68]);
    });

    it('returns empty array for invalid hex', () => {
      expect(hexToRGB('invalid')).toEqual([]);
    });
  });

  describe('objectKeys', () => {
    it('returns typed array of keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(objectKeys(obj)).toEqual(['a', 'b', 'c']);
    });
  });

  describe('omit', () => {
    it('removes specified keys', () => {
      const result = omit({ a: 1, b: 2, c: 3 }, 'b');
      expect(result).toEqual({ a: 1, c: 3 });
    });

    it('removes multiple keys', () => {
      const result = omit({ a: 1, b: 2, c: 3 }, 'a', 'c');
      expect(result).toEqual({ b: 2 });
    });

    it('throws for non-object input', () => {
      expect(() => omit(null as any, 'a')).toThrow('Expected an object');
    });
  });

  describe('pick', () => {
    it('selects specified keys', () => {
      const result = pick({ a: 1, b: 2, c: 3 }, 'a', 'c');
      expect(result).toEqual({ a: 1, c: 3 });
    });

    it('returns full object when no filter', () => {
      const obj = { a: 1, b: 2 };
      expect(pick(obj)).toEqual(obj);
    });

    it('throws for non-object input', () => {
      expect(() => pick(null as any, 'a')).toThrow('Expected an object');
    });
  });

  describe('getObjectType', () => {
    it('returns correct types', () => {
      expect(getObjectType('hello')).toBe('string');
      expect(getObjectType(42)).toBe('number');
      expect(getObjectType([])).toBe('array');
      expect(getObjectType({})).toBe('object');
      expect(getObjectType(null)).toBe('null');
      expect(getObjectType(undefined)).toBe('undefined');
    });
  });

  describe('shouldScroll', () => {
    const baseOptions = {
      isFirstStep: false,
      lifecycle: LIFECYCLE.TOOLTIP,
      previousLifecycle: LIFECYCLE.BEACON,
      scrollToFirstStep: false,
      step: { target: '.a', content: 'A', disableScrolling: false, placement: 'bottom' as const, isFixed: false },
      target: document.createElement('div'),
    };

    it('returns true for normal tooltip transition', () => {
      expect(shouldScroll(baseOptions)).toBe(true);
    });

    it('returns false when scrolling is disabled', () => {
      expect(shouldScroll({
        ...baseOptions,
        step: { ...baseOptions.step, disableScrolling: true },
      })).toBe(false);
    });

    it('returns false for center placement', () => {
      expect(shouldScroll({
        ...baseOptions,
        step: { ...baseOptions.step, placement: 'center' },
      })).toBe(false);
    });

    it('returns false when lifecycle has not changed', () => {
      expect(shouldScroll({
        ...baseOptions,
        previousLifecycle: LIFECYCLE.TOOLTIP,
      })).toBe(false);
    });

    it('returns false for first step without scrollToFirstStep (beacon lifecycle)', () => {
      expect(shouldScroll({
        ...baseOptions,
        isFirstStep: true,
        lifecycle: LIFECYCLE.BEACON,
        previousLifecycle: LIFECYCLE.READY,
      })).toBe(false);
    });

    it('returns true for first step with scrollToFirstStep', () => {
      expect(shouldScroll({
        ...baseOptions,
        isFirstStep: true,
        scrollToFirstStep: true,
        lifecycle: LIFECYCLE.BEACON,
        previousLifecycle: LIFECYCLE.READY,
      })).toBe(true);
    });
  });

  describe('noop', () => {
    it('returns undefined', () => {
      expect(noop()).toBeUndefined();
    });
  });
});
