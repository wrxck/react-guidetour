import { describe, it, expect, vi } from 'vitest';
import { canUseDOM, getElement, getClientRect, getDocumentHeight, isElementVisible } from '../dom';

describe('dom', () => {
  describe('canUseDOM', () => {
    it('returns true in JSDOM', () => {
      expect(canUseDOM()).toBe(true);
    });
  });

  describe('getElement', () => {
    it('returns element for valid selector', () => {
      const div = document.createElement('div');
      div.id = 'test-element';
      document.body.appendChild(div);

      expect(getElement('#test-element')).toBe(div);

      document.body.removeChild(div);
    });

    it('returns null for invalid selector', () => {
      expect(getElement('#nonexistent')).toBeNull();
    });

    it('returns the element itself when passed an HTMLElement', () => {
      const div = document.createElement('div');
      expect(getElement(div)).toBe(div);
    });

    it('returns null for invalid CSS selector syntax', () => {
      expect(getElement('[invalid')).toBeNull();
    });
  });

  describe('getClientRect', () => {
    it('returns null for null element', () => {
      expect(getClientRect(null)).toBeNull();
    });

    it('returns bounding rect for valid element', () => {
      const div = document.createElement('div');
      document.body.appendChild(div);

      const rect = getClientRect(div);
      expect(rect).toBeDefined();
      expect(rect).toHaveProperty('top');
      expect(rect).toHaveProperty('left');
      expect(rect).toHaveProperty('width');
      expect(rect).toHaveProperty('height');

      document.body.removeChild(div);
    });
  });

  describe('getDocumentHeight', () => {
    it('returns a number', () => {
      expect(typeof getDocumentHeight()).toBe('number');
    });

    it('returns median when requested', () => {
      expect(typeof getDocumentHeight(true)).toBe('number');
    });
  });

  describe('isElementVisible', () => {
    it('returns true for visible element', () => {
      const div = document.createElement('div');
      document.body.appendChild(div);

      expect(isElementVisible(div)).toBe(true);

      document.body.removeChild(div);
    });

    it('returns false for null', () => {
      expect(isElementVisible(null as any)).toBe(false);
    });

    it('returns false for display:none element', () => {
      const div = document.createElement('div');
      div.style.display = 'none';
      document.body.appendChild(div);

      expect(isElementVisible(div)).toBe(false);

      document.body.removeChild(div);
    });

    it('returns false for hidden parent', () => {
      const parent = document.createElement('div');
      parent.style.display = 'none';
      const child = document.createElement('div');
      parent.appendChild(child);
      document.body.appendChild(parent);

      expect(isElementVisible(child)).toBe(false);

      document.body.removeChild(parent);
    });
  });
});
