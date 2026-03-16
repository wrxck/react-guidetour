import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import treeChanges from 'tree-changes';

import {
  getClientRect,
  getDocumentHeight,
  getElement,
  getElementPosition,
  getScrollParent,
  hasCustomScrollParent,
  hasPosition,
} from '~/modules/dom';
import { isSafari, log } from '~/modules/helpers';

import { LIFECYCLE } from '~/literals';

import { Lifecycle, OverlayProps } from '~/types';

import Spotlight from './Spotlight';

interface SpotlightStyles extends React.CSSProperties {
  height: number;
  left: number;
  top: number;
  width: number;
}

export default function JoyrideOverlay(props: OverlayProps) {
  const {
    continuous,
    debug,
    disableOverlay,
    disableOverlayClose,
    disableScrolling,
    disableScrollParentFix = false,
    lifecycle,
    onClickOverlay,
    placement,
    spotlightClicks,
    spotlightPadding = 0,
    styles,
    target,
  } = props;

  const [isScrolling, setIsScrolling] = useState(false);
  const [mouseOverSpotlight, setMouseOverSpotlight] = useState(false);
  const [showSpotlight, setShowSpotlight] = useState(true);
  const [, setForceRender] = useState(0);

  const isActiveRef = useRef(false);
  const resizeTimeoutRef = useRef<number | undefined>(undefined);
  const scrollTimeoutRef = useRef<number | undefined>(undefined);
  const scrollParentRef = useRef<Document | Element | undefined>(undefined);
  const previousPropsRef = useRef(props);

  const getSpotlightStyles = useCallback((): SpotlightStyles => {
    const element = getElement(target);
    const elementRect = getClientRect(element);
    const isFixedTarget = hasPosition(element);
    const top = getElementPosition(element, spotlightPadding, disableScrollParentFix);

    return {
      ...styles.spotlight,
      height: Math.round((elementRect?.height ?? 0) + spotlightPadding * 2),
      left: Math.round((elementRect?.left ?? 0) - spotlightPadding),
      opacity: showSpotlight ? 1 : 0,
      pointerEvents: spotlightClicks ? 'none' : 'auto',
      position: isFixedTarget ? 'fixed' : 'absolute',
      top,
      transition: 'opacity 0.2s',
      width: Math.round((elementRect?.width ?? 0) + spotlightPadding * 2),
    } satisfies React.CSSProperties;
  }, [target, spotlightPadding, disableScrollParentFix, styles.spotlight, showSpotlight, spotlightClicks]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const spotStyles = getSpotlightStyles();
    const { height, left, position, top, width } = spotStyles;

    const offsetY = position === 'fixed' ? event.clientY : event.pageY;
    const offsetX = position === 'fixed' ? event.clientX : event.pageX;
    const inSpotlightHeight = offsetY >= top && offsetY <= top + height;
    const inSpotlightWidth = offsetX >= left && offsetX <= left + width;
    const inSpotlight = inSpotlightWidth && inSpotlightHeight;

    setMouseOverSpotlight(prev => {
      if (inSpotlight !== prev) {
        return inSpotlight;
      }
      return prev;
    });
  }, [getSpotlightStyles]);

  const handleScroll = useCallback(() => {
    const element = getElement(target);

    if (scrollParentRef.current !== document) {
      setIsScrolling(prev => {
        if (!prev) {
          setShowSpotlight(false);
          return true;
        }
        return prev;
      });

      clearTimeout(scrollTimeoutRef.current);

      scrollTimeoutRef.current = window.setTimeout(() => {
        if (isActiveRef.current) {
          setIsScrolling(false);
          setShowSpotlight(true);
        }
      }, 50);
    } else if (hasPosition(element, 'sticky')) {
      setForceRender(c => c + 1);
    }
  }, [target]);

  const handleResize = useCallback(() => {
    clearTimeout(resizeTimeoutRef.current);

    resizeTimeoutRef.current = window.setTimeout(() => {
      if (isActiveRef.current) {
        setForceRender(c => c + 1);
      }
    }, 100);
  }, []);

  // Mount/unmount
  useEffect(() => {
    const element = getElement(target);
    scrollParentRef.current = getScrollParent(element ?? document.body, disableScrollParentFix, true);
    isActiveRef.current = true;

    if (process.env.NODE_ENV !== 'production') {
      if (!disableScrolling && hasCustomScrollParent(element, true)) {
        log({
          title: 'step has a custom scroll parent and can cause trouble with scrolling',
          data: [{ key: 'parent', value: scrollParentRef.current }],
          debug,
        });
      }
    }

    window.addEventListener('resize', handleResize);

    return () => {
      isActiveRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeoutRef.current);
      clearTimeout(scrollTimeoutRef.current);
      scrollParentRef.current?.removeEventListener('scroll', handleScroll);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // componentDidUpdate equivalent
  useEffect(() => {
    const previousProps = previousPropsRef.current;
    const { changed } = treeChanges(previousProps, props);

    if (changed('target') || changed('disableScrollParentFix')) {
      const element = getElement(target);
      scrollParentRef.current = getScrollParent(element ?? document.body, disableScrollParentFix, true);
    }

    if (changed('lifecycle', LIFECYCLE.TOOLTIP)) {
      scrollParentRef.current?.addEventListener('scroll', handleScroll, { passive: true });

      setTimeout(() => {
        if (!isScrolling) {
          setShowSpotlight(true);
        }
      }, 100);
    }

    if (changed('spotlightClicks') || changed('disableOverlay') || changed('lifecycle')) {
      if (spotlightClicks && lifecycle === LIFECYCLE.TOOLTIP) {
        window.addEventListener('mousemove', handleMouseMove, false);
      } else if (lifecycle !== LIFECYCLE.TOOLTIP) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    }

    previousPropsRef.current = props;
  });

  const hideSpotlight = () => {
    const hiddenLifecycles = [
      LIFECYCLE.INIT,
      LIFECYCLE.BEACON,
      LIFECYCLE.COMPLETE,
      LIFECYCLE.ERROR,
    ] as Lifecycle[];

    return (
      disableOverlay ||
      (continuous ? hiddenLifecycles.includes(lifecycle) : lifecycle !== LIFECYCLE.TOOLTIP)
    );
  };

  if (hideSpotlight()) {
    return null;
  }

  const spotlightStyles = getSpotlightStyles();

  const overlayStyles: React.CSSProperties = {
    cursor: disableOverlayClose ? 'default' : 'pointer',
    height: getDocumentHeight(),
    pointerEvents: mouseOverSpotlight ? 'none' : 'auto',
    ...styles.overlay,
  };

  let spotlight = placement !== 'center' && showSpotlight && (
    <Spotlight styles={spotlightStyles} />
  );

  // Hack for Safari bug with mix-blend-mode with z-index
  if (isSafari()) {
    const { mixBlendMode, zIndex, ...safariOverlay } = overlayStyles;

    spotlight = <div style={{ ...safariOverlay }}>{spotlight}</div>;
    delete overlayStyles.backgroundColor;
  }

  return (
    <div
      className="react-joyride__overlay"
      data-test-id="overlay"
      onClick={onClickOverlay}
      role="presentation"
      style={overlayStyles}
    >
      {spotlight}
    </div>
  );
}
