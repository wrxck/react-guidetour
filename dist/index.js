"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.tsx
var index_exports = {};
__export(index_exports, {
  ACTIONS: () => ACTIONS,
  EVENTS: () => EVENTS,
  LIFECYCLE: () => LIFECYCLE,
  ORIGIN: () => ORIGIN,
  STATUS: () => STATUS,
  default: () => components_default
});
module.exports = __toCommonJS(index_exports);

// src/literals/index.ts
var ACTIONS = {
  INIT: "init",
  START: "start",
  STOP: "stop",
  RESET: "reset",
  PREV: "prev",
  NEXT: "next",
  GO: "go",
  CLOSE: "close",
  SKIP: "skip",
  UPDATE: "update"
};
var EVENTS = {
  TOUR_START: "tour:start",
  STEP_BEFORE: "step:before",
  BEACON: "beacon",
  TOOLTIP: "tooltip",
  STEP_AFTER: "step:after",
  TOUR_END: "tour:end",
  TOUR_STATUS: "tour:status",
  TARGET_NOT_FOUND: "error:target_not_found",
  ERROR: "error"
};
var LIFECYCLE = {
  INIT: "init",
  READY: "ready",
  BEACON: "beacon",
  TOOLTIP: "tooltip",
  COMPLETE: "complete",
  ERROR: "error"
};
var ORIGIN = {
  BUTTON_CLOSE: "button_close",
  BUTTON_PRIMARY: "button_primary",
  KEYBOARD: "keyboard",
  OVERLAY: "overlay"
};
var STATUS = {
  IDLE: "idle",
  READY: "ready",
  WAITING: "waiting",
  RUNNING: "running",
  PAUSED: "paused",
  SKIPPED: "skipped",
  FINISHED: "finished",
  ERROR: "error"
};

// src/components/index.tsx
var import_react6 = require("react");
var import_deep_equal = __toESM(require("@gilbarbara/deep-equal"));
var import_is_lite6 = __toESM(require("is-lite"));
var import_tree_changes3 = __toESM(require("tree-changes"));

// src/modules/dom.ts
var import_scroll = __toESM(require("scroll"));
var import_scrollparent = __toESM(require("scrollparent"));
function canUseDOM() {
  var _a;
  return !!(typeof window !== "undefined" && ((_a = window.document) == null ? void 0 : _a.createElement));
}
function getClientRect(element) {
  if (!element) {
    return null;
  }
  return element.getBoundingClientRect();
}
function getDocumentHeight(median = false) {
  const { body, documentElement } = document;
  if (!body || !documentElement) {
    return 0;
  }
  if (median) {
    const heights = [
      body.scrollHeight,
      body.offsetHeight,
      documentElement.clientHeight,
      documentElement.scrollHeight,
      documentElement.offsetHeight
    ].sort((a, b) => a - b);
    const middle = Math.floor(heights.length / 2);
    if (heights.length % 2 === 0) {
      return (heights[middle - 1] + heights[middle]) / 2;
    }
    return heights[middle];
  }
  return Math.max(
    body.scrollHeight,
    body.offsetHeight,
    documentElement.clientHeight,
    documentElement.scrollHeight,
    documentElement.offsetHeight
  );
}
function getElement(element) {
  if (typeof element === "string") {
    try {
      return document.querySelector(element);
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error(error);
      }
      return null;
    }
  }
  return element;
}
function getStyleComputedProperty(el) {
  if (!el || el.nodeType !== 1) {
    return null;
  }
  return getComputedStyle(el);
}
function getScrollParent(element, skipFix, forListener) {
  if (!element) {
    return scrollDocument();
  }
  const parent = (0, import_scrollparent.default)(element);
  if (parent) {
    if (parent.isSameNode(scrollDocument())) {
      if (forListener) {
        return document;
      }
      return scrollDocument();
    }
    const hasScrolling = parent.scrollHeight > parent.offsetHeight;
    if (!hasScrolling && !skipFix) {
      parent.style.overflow = "initial";
      return scrollDocument();
    }
  }
  return parent;
}
function hasCustomScrollParent(element, skipFix) {
  if (!element) {
    return false;
  }
  const parent = getScrollParent(element, skipFix);
  return parent ? !parent.isSameNode(scrollDocument()) : false;
}
function hasCustomOffsetParent(element) {
  return element.offsetParent !== document.body;
}
function hasPosition(el, type = "fixed") {
  if (!el || !(el instanceof HTMLElement)) {
    return false;
  }
  const { nodeName } = el;
  const styles = getStyleComputedProperty(el);
  if (nodeName === "BODY" || nodeName === "HTML") {
    return false;
  }
  if (styles && styles.position === type) {
    return true;
  }
  if (!el.parentNode) {
    return false;
  }
  return hasPosition(el.parentNode, type);
}
function isElementVisible(element) {
  var _a;
  if (!element) {
    return false;
  }
  let parentElement = element;
  while (parentElement) {
    if (parentElement === document.body) {
      break;
    }
    if (parentElement instanceof HTMLElement) {
      const { display, visibility } = getComputedStyle(parentElement);
      if (display === "none" || visibility === "hidden") {
        return false;
      }
    }
    parentElement = (_a = parentElement.parentElement) != null ? _a : null;
  }
  return true;
}
function getElementPosition(element, offset, skipFix) {
  var _a, _b, _c;
  const elementRect = getClientRect(element);
  const parent = getScrollParent(element, skipFix);
  const hasScrollParent = hasCustomScrollParent(element, skipFix);
  const isFixedTarget = hasPosition(element);
  let parentTop = 0;
  let top = (_a = elementRect == null ? void 0 : elementRect.top) != null ? _a : 0;
  if (hasScrollParent && isFixedTarget) {
    const offsetTop = (_b = element == null ? void 0 : element.offsetTop) != null ? _b : 0;
    const parentScrollTop = (_c = parent == null ? void 0 : parent.scrollTop) != null ? _c : 0;
    top = offsetTop - parentScrollTop;
  } else if (parent instanceof HTMLElement) {
    parentTop = parent.scrollTop;
    if (!hasScrollParent && !hasPosition(element)) {
      top += parentTop;
    }
    if (!parent.isSameNode(scrollDocument())) {
      top += scrollDocument().scrollTop;
    }
  }
  return Math.floor(top - offset);
}
function getScrollTo(element, offset, skipFix) {
  var _a;
  if (!element) {
    return 0;
  }
  const { offsetTop = 0, scrollTop = 0 } = (_a = (0, import_scrollparent.default)(element)) != null ? _a : {};
  let top = element.getBoundingClientRect().top + scrollTop;
  if (!!offsetTop && (hasCustomScrollParent(element, skipFix) || hasCustomOffsetParent(element))) {
    top -= offsetTop;
  }
  const output = Math.floor(top - offset);
  return output < 0 ? 0 : output;
}
function scrollDocument() {
  var _a;
  return (_a = document.scrollingElement) != null ? _a : document.documentElement;
}
function scrollTo(value, options) {
  const { duration, element } = options;
  return new Promise((resolve, reject) => {
    const { scrollTop } = element;
    const limit = value > scrollTop ? value - scrollTop : scrollTop - value;
    import_scroll.default.top(element, value, { duration: limit < 100 ? 50 : duration }, (error) => {
      if (error && error.message !== "Element already at target scroll position") {
        return reject(error);
      }
      return resolve();
    });
  });
}

// src/modules/helpers.tsx
var import_react = require("react");
var import_react_innertext = __toESM(require("react-innertext"));
var import_is_lite = __toESM(require("is-lite"));
function isSafari() {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }
  return /(Version\/([\d._]+).*Safari|CriOS|FxiOS| Mobile\/)/.test(navigator.userAgent);
}
function getObjectType(value) {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}
function getReactNodeText(input, options = {}) {
  const { defaultValue, step, steps } = options;
  let text = (0, import_react_innertext.default)(input);
  if (!text) {
    if ((0, import_react.isValidElement)(input) && !Object.values(input.props).length && getObjectType(input.type) === "function") {
      const component = input.type({});
      text = getReactNodeText(component, options);
    } else {
      text = (0, import_react_innertext.default)(defaultValue);
    }
  } else if ((text.includes("{step}") || text.includes("{steps}")) && step && steps) {
    text = text.replace("{step}", step.toString()).replace("{steps}", steps.toString());
  }
  return text;
}
function hasValidKeys(object, keys) {
  if (!import_is_lite.default.plainObject(object) || !import_is_lite.default.array(keys)) {
    return false;
  }
  return Object.keys(object).every((d) => keys.includes(d));
}
function hexToRGB(hex) {
  const shorthandRegex = /^#?([\da-f])([\da-f])([\da-f])$/i;
  const properHex = hex.replace(shorthandRegex, (_m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(properHex);
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [];
}
function hideBeacon(step) {
  return step.disableBeacon || step.placement === "center";
}
function log({ data, debug = false, title, warn = false }) {
  const logFn = warn ? console.warn || console.error : console.log;
  if (debug) {
    if (title && data) {
      console.groupCollapsed(
        `%creact-guidetour: ${title}`,
        "color: #ff0044; font-weight: bold; font-size: 12px;"
      );
      if (Array.isArray(data)) {
        data.forEach((d) => {
          if (import_is_lite.default.plainObject(d) && d.key) {
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
      console.error("Missing title or data props");
    }
  }
}
function noop() {
  return void 0;
}
function objectKeys(input) {
  return Object.keys(input);
}
function omit(input, ...filter) {
  if (!import_is_lite.default.plainObject(input)) {
    throw new TypeError("Expected an object");
  }
  const output = {};
  for (const key in input) {
    if ({}.hasOwnProperty.call(input, key)) {
      if (!filter.includes(key)) {
        output[key] = input[key];
      }
    }
  }
  return output;
}
function pick(input, ...filter) {
  if (!import_is_lite.default.plainObject(input)) {
    throw new TypeError("Expected an object");
  }
  if (!filter.length) {
    return input;
  }
  const output = {};
  for (const key in input) {
    if ({}.hasOwnProperty.call(input, key)) {
      if (filter.includes(key)) {
        output[key] = input[key];
      }
    }
  }
  return output;
}
function replaceLocaleContent(input, step, steps) {
  const replacer = (text) => text.replace("{step}", String(step)).replace("{steps}", String(steps));
  if (getObjectType(input) === "string") {
    return replacer(input);
  }
  if (!(0, import_react.isValidElement)(input)) {
    return input;
  }
  const { children } = input.props;
  if (getObjectType(children) === "string" && children.includes("{step}")) {
    return (0, import_react.cloneElement)(input, {
      children: replacer(children)
    });
  }
  if (Array.isArray(children)) {
    return (0, import_react.cloneElement)(input, {
      children: children.map((child) => {
        if (typeof child === "string") {
          return replacer(child);
        }
        return replaceLocaleContent(child, step, steps);
      })
    });
  }
  if (getObjectType(input.type) === "function" && !Object.values(input.props).length) {
    const component = input.type({});
    return replaceLocaleContent(component, step, steps);
  }
  return input;
}
function shouldScroll(options) {
  const { isFirstStep, lifecycle, previousLifecycle, scrollToFirstStep, step, target } = options;
  return !step.disableScrolling && (!isFirstStep || scrollToFirstStep || lifecycle === LIFECYCLE.TOOLTIP) && step.placement !== "center" && (!step.isFixed || !hasPosition(target)) && // fixed steps don't need to scroll
  previousLifecycle !== lifecycle && [LIFECYCLE.BEACON, LIFECYCLE.TOOLTIP].includes(lifecycle);
}

// src/modules/step.ts
var import_deepmerge2 = __toESM(require("deepmerge"));
var import_is_lite2 = __toESM(require("is-lite"));

// src/defaults.ts
var defaultFloaterProps = {
  wrapperOptions: {
    offset: -18,
    position: true
  }
};
var defaultLocale = {
  back: "Back",
  close: "Close",
  last: "Last",
  next: "Next",
  nextLabelWithProgress: "Next (Step {step} of {steps})",
  open: "Open the dialog",
  skip: "Skip"
};
var defaultStep = {
  event: "click",
  placement: "bottom",
  offset: 10,
  disableBeacon: false,
  disableCloseOnEsc: false,
  disableOverlay: false,
  disableOverlayClose: false,
  disableScrollParentFix: false,
  disableScrolling: false,
  hideBackButton: false,
  hideCloseButton: false,
  hideFooter: false,
  isFixed: false,
  locale: defaultLocale,
  showProgress: false,
  showSkipButton: false,
  spotlightClicks: false,
  spotlightPadding: 10
};
var defaultProps = {
  continuous: false,
  debug: false,
  disableCloseOnEsc: false,
  disableOverlay: false,
  disableOverlayClose: false,
  disableScrolling: false,
  disableScrollParentFix: false,
  getHelpers: noop(),
  hideBackButton: false,
  run: true,
  scrollOffset: 20,
  scrollDuration: 300,
  scrollToFirstStep: false,
  showSkipButton: false,
  showProgress: false,
  spotlightClicks: false,
  spotlightPadding: 10,
  steps: []
};

// src/styles.ts
var import_deepmerge = __toESM(require("deepmerge"));
var defaultOptions = {
  arrowColor: "#fff",
  backgroundColor: "#fff",
  beaconSize: 36,
  overlayColor: "rgba(0, 0, 0, 0.5)",
  primaryColor: "#f04",
  spotlightShadow: "0 0 15px rgba(0, 0, 0, 0.5)",
  textColor: "#333",
  width: 380,
  zIndex: 100
};
var buttonBase = {
  backgroundColor: "transparent",
  border: 0,
  borderRadius: 0,
  color: "#555",
  cursor: "pointer",
  fontSize: 16,
  lineHeight: 1,
  padding: 8,
  WebkitAppearance: "none"
};
var spotlight = {
  borderRadius: 4,
  position: "absolute"
};
function getStyles(props, step) {
  var _a, _b, _c, _d, _e;
  const { floaterProps, styles } = props;
  const mergedFloaterProps = (0, import_deepmerge.default)((_a = step.floaterProps) != null ? _a : {}, floaterProps != null ? floaterProps : {});
  const mergedStyles = (0, import_deepmerge.default)(styles != null ? styles : {}, (_b = step.styles) != null ? _b : {});
  const options = (0, import_deepmerge.default)(defaultOptions, mergedStyles.options || {});
  const hideBeacon2 = step.placement === "center" || step.disableBeacon;
  let { width } = options;
  if (window.innerWidth > 480) {
    width = 380;
  }
  if ("width" in options) {
    width = typeof options.width === "number" && window.innerWidth < options.width ? window.innerWidth - 30 : options.width;
  }
  const overlay = {
    bottom: 0,
    left: 0,
    overflow: "hidden",
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: options.zIndex
  };
  const defaultStyles = {
    beacon: {
      ...buttonBase,
      display: hideBeacon2 ? "none" : "inline-block",
      height: options.beaconSize,
      position: "relative",
      width: options.beaconSize,
      zIndex: options.zIndex
    },
    beaconInner: {
      animation: "joyride-beacon-inner 1.2s infinite ease-in-out",
      backgroundColor: options.primaryColor,
      borderRadius: "50%",
      display: "block",
      height: "50%",
      left: "50%",
      opacity: 0.7,
      position: "absolute",
      top: "50%",
      transform: "translate(-50%, -50%)",
      width: "50%"
    },
    beaconOuter: {
      animation: "joyride-beacon-outer 1.2s infinite ease-in-out",
      backgroundColor: `rgba(${hexToRGB(options.primaryColor).join(",")}, 0.2)`,
      border: `2px solid ${options.primaryColor}`,
      borderRadius: "50%",
      boxSizing: "border-box",
      display: "block",
      height: "100%",
      left: 0,
      opacity: 0.9,
      position: "absolute",
      top: 0,
      transformOrigin: "center",
      width: "100%"
    },
    tooltip: {
      backgroundColor: options.backgroundColor,
      borderRadius: 5,
      boxSizing: "border-box",
      color: options.textColor,
      fontSize: 16,
      maxWidth: "100%",
      padding: 15,
      position: "relative",
      width
    },
    tooltipContainer: {
      lineHeight: 1.4,
      textAlign: "center"
    },
    tooltipTitle: {
      fontSize: 18,
      margin: 0
    },
    tooltipContent: {
      padding: "20px 10px"
    },
    tooltipFooter: {
      alignItems: "center",
      display: "flex",
      justifyContent: "flex-end",
      marginTop: 15
    },
    tooltipFooterSpacer: {
      flex: 1
    },
    buttonNext: {
      ...buttonBase,
      backgroundColor: options.primaryColor,
      borderRadius: 4,
      color: "#fff"
    },
    buttonBack: {
      ...buttonBase,
      color: options.primaryColor,
      marginLeft: "auto",
      marginRight: 5
    },
    buttonClose: {
      ...buttonBase,
      color: options.textColor,
      height: 14,
      padding: 15,
      position: "absolute",
      right: 0,
      top: 0,
      width: 14
    },
    buttonSkip: {
      ...buttonBase,
      color: options.textColor,
      fontSize: 14
    },
    overlay: {
      ...overlay,
      backgroundColor: options.overlayColor,
      mixBlendMode: "hard-light"
    },
    overlayLegacy: {
      ...overlay
    },
    overlayLegacyCenter: {
      ...overlay,
      backgroundColor: options.overlayColor
    },
    spotlight: {
      ...spotlight,
      backgroundColor: "gray"
    },
    spotlightLegacy: {
      ...spotlight,
      boxShadow: `0 0 0 9999px ${options.overlayColor}, ${options.spotlightShadow}`
    },
    floaterStyles: {
      arrow: {
        color: (_e = (_d = (_c = mergedFloaterProps == null ? void 0 : mergedFloaterProps.styles) == null ? void 0 : _c.arrow) == null ? void 0 : _d.color) != null ? _e : options.arrowColor
      },
      options: {
        zIndex: options.zIndex + 100
      }
    },
    options
  };
  return (0, import_deepmerge.default)(defaultStyles, mergedStyles);
}

// src/modules/step.ts
function getTourProps(props) {
  return pick(
    props,
    "beaconComponent",
    "disableCloseOnEsc",
    "disableOverlay",
    "disableOverlayClose",
    "disableScrolling",
    "disableScrollParentFix",
    "floaterProps",
    "hideBackButton",
    "hideCloseButton",
    "locale",
    "showProgress",
    "showSkipButton",
    "spotlightClicks",
    "spotlightPadding",
    "styles",
    "tooltipComponent"
  );
}
function getMergedStep(props, currentStep) {
  var _a, _b, _c, _d, _e, _f, _g;
  const step = currentStep != null ? currentStep : {};
  const mergedStep = import_deepmerge2.default.all([defaultStep, getTourProps(props), step], {
    isMergeableObject: import_is_lite2.default.plainObject
  });
  const mergedStyles = getStyles(props, mergedStep);
  const scrollParent2 = hasCustomScrollParent(
    getElement(mergedStep.target),
    mergedStep.disableScrollParentFix
  );
  const floaterProps = import_deepmerge2.default.all([
    defaultFloaterProps,
    (_a = props.floaterProps) != null ? _a : {},
    (_b = mergedStep.floaterProps) != null ? _b : {}
  ]);
  floaterProps.offset = mergedStep.offset;
  floaterProps.styles = (0, import_deepmerge2.default)((_c = floaterProps.styles) != null ? _c : {}, mergedStyles.floaterStyles);
  floaterProps.offset += (_e = (_d = props.spotlightPadding) != null ? _d : mergedStep.spotlightPadding) != null ? _e : 0;
  if (mergedStep.placementBeacon && floaterProps.wrapperOptions) {
    floaterProps.wrapperOptions.placement = mergedStep.placementBeacon;
  }
  if (scrollParent2 && ((_f = floaterProps.modifiers) == null ? void 0 : _f.preventOverflow)) {
    floaterProps.modifiers.preventOverflow.options = {
      ...floaterProps.modifiers.preventOverflow.options,
      boundary: "window"
    };
  }
  return {
    ...mergedStep,
    locale: import_deepmerge2.default.all([defaultLocale, (_g = props.locale) != null ? _g : {}, mergedStep.locale || {}]),
    floaterProps,
    styles: omit(mergedStyles, "floaterStyles")
  };
}
function validateStep(step, debug = false) {
  if (!import_is_lite2.default.plainObject(step)) {
    log({
      title: "validateStep",
      data: "step must be an object",
      warn: true,
      debug
    });
    return false;
  }
  if (!step.target) {
    log({
      title: "validateStep",
      data: "target is missing from the step",
      warn: true,
      debug
    });
    return false;
  }
  return true;
}
function validateSteps(steps, debug = false) {
  if (!import_is_lite2.default.array(steps)) {
    log({
      title: "validateSteps",
      data: "steps must be an array",
      warn: true,
      debug
    });
    return false;
  }
  return steps.every((d) => validateStep(d, debug));
}

// src/modules/store.ts
var import_is_lite3 = __toESM(require("is-lite"));
var defaultState = {
  action: "init",
  controlled: false,
  index: 0,
  lifecycle: LIFECYCLE.INIT,
  origin: null,
  size: 0,
  status: STATUS.IDLE
};
var validKeys = objectKeys(omit(defaultState, "controlled", "size"));
var Store = class {
  constructor(options) {
    this.data = /* @__PURE__ */ new Map();
    this.store = /* @__PURE__ */ new Map();
    this.addListener = (listener) => {
      this.listener = listener;
    };
    this.setSteps = (steps) => {
      const { size, status } = this.getState();
      const state = {
        size: steps.length,
        status
      };
      this.data.set("steps", steps);
      if (status === STATUS.WAITING && !size && steps.length) {
        state.status = STATUS.RUNNING;
      }
      this.setState(state);
    };
    this.getPopper = (name) => {
      if (name === "beacon") {
        return this.beaconPopper;
      }
      return this.tooltipPopper;
    };
    this.setPopper = (name, popper) => {
      if (name === "beacon") {
        this.beaconPopper = popper;
      } else {
        this.tooltipPopper = popper;
      }
    };
    this.cleanupPoppers = () => {
      this.beaconPopper = null;
      this.tooltipPopper = null;
    };
    this.close = (origin = null) => {
      const { index, status } = this.getState();
      if (status !== STATUS.RUNNING) {
        return;
      }
      this.setState({
        ...this.getNextState({ action: ACTIONS.CLOSE, index: index + 1, origin })
      });
    };
    this.go = (nextIndex) => {
      const { controlled, status } = this.getState();
      if (controlled || status !== STATUS.RUNNING) {
        return;
      }
      const step = this.getSteps()[nextIndex];
      this.setState({
        ...this.getNextState({ action: ACTIONS.GO, index: nextIndex }),
        status: step ? status : STATUS.FINISHED
      });
    };
    this.info = () => this.getState();
    this.next = () => {
      const { index, status } = this.getState();
      if (status !== STATUS.RUNNING) {
        return;
      }
      this.setState(this.getNextState({ action: ACTIONS.NEXT, index: index + 1 }));
    };
    this.open = () => {
      const { status } = this.getState();
      if (status !== STATUS.RUNNING) {
        return;
      }
      this.setState({
        ...this.getNextState({ action: ACTIONS.UPDATE, lifecycle: LIFECYCLE.TOOLTIP })
      });
    };
    this.prev = () => {
      const { index, status } = this.getState();
      if (status !== STATUS.RUNNING) {
        return;
      }
      this.setState({
        ...this.getNextState({ action: ACTIONS.PREV, index: index - 1 })
      });
    };
    this.reset = (restart = false) => {
      const { controlled } = this.getState();
      if (controlled) {
        return;
      }
      this.setState({
        ...this.getNextState({ action: ACTIONS.RESET, index: 0 }),
        status: restart ? STATUS.RUNNING : STATUS.READY
      });
    };
    this.skip = () => {
      const { status } = this.getState();
      if (status !== STATUS.RUNNING) {
        return;
      }
      this.setState({
        action: ACTIONS.SKIP,
        lifecycle: LIFECYCLE.INIT,
        status: STATUS.SKIPPED
      });
    };
    this.start = (nextIndex) => {
      const { index, size } = this.getState();
      this.setState({
        ...this.getNextState(
          {
            action: ACTIONS.START,
            index: import_is_lite3.default.number(nextIndex) ? nextIndex : index
          },
          true
        ),
        status: size ? STATUS.RUNNING : STATUS.WAITING
      });
    };
    this.stop = (advance = false) => {
      const { index, status } = this.getState();
      if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
        return;
      }
      this.setState({
        ...this.getNextState({ action: ACTIONS.STOP, index: index + (advance ? 1 : 0) }),
        status: STATUS.PAUSED
      });
    };
    this.update = (state) => {
      var _a, _b;
      if (!hasValidKeys(state, validKeys)) {
        throw new Error(`State is not valid. Valid keys: ${validKeys.join(", ")}`);
      }
      this.setState({
        ...this.getNextState(
          {
            ...this.getState(),
            ...state,
            action: (_a = state.action) != null ? _a : ACTIONS.UPDATE,
            origin: (_b = state.origin) != null ? _b : null
          },
          true
        )
      });
    };
    const { continuous = false, stepIndex, steps = [] } = options != null ? options : {};
    this.setState(
      {
        action: ACTIONS.INIT,
        controlled: import_is_lite3.default.number(stepIndex),
        continuous,
        index: import_is_lite3.default.number(stepIndex) ? stepIndex : 0,
        lifecycle: LIFECYCLE.INIT,
        origin: null,
        status: steps.length ? STATUS.READY : STATUS.IDLE
      },
      true
    );
    this.beaconPopper = null;
    this.tooltipPopper = null;
    this.listener = null;
    this.setSteps(steps);
  }
  getState() {
    if (!this.store.size) {
      return { ...defaultState };
    }
    return {
      action: this.store.get("action") || "",
      controlled: this.store.get("controlled") || false,
      index: parseInt(this.store.get("index"), 10),
      lifecycle: this.store.get("lifecycle") || "",
      origin: this.store.get("origin") || null,
      size: this.store.get("size") || 0,
      status: this.store.get("status") || ""
    };
  }
  getNextState(state, force = false) {
    var _a, _b, _c, _d, _e;
    const { action, controlled, index, size, status } = this.getState();
    const newIndex = import_is_lite3.default.number(state.index) ? state.index : index;
    const nextIndex = controlled && !force ? index : Math.min(Math.max(newIndex, 0), size);
    return {
      action: (_a = state.action) != null ? _a : action,
      controlled,
      index: nextIndex,
      lifecycle: (_b = state.lifecycle) != null ? _b : LIFECYCLE.INIT,
      origin: (_c = state.origin) != null ? _c : null,
      size: (_d = state.size) != null ? _d : size,
      status: nextIndex === size ? STATUS.FINISHED : (_e = state.status) != null ? _e : status
    };
  }
  getSteps() {
    const steps = this.data.get("steps");
    return Array.isArray(steps) ? steps : [];
  }
  hasUpdatedState(oldState) {
    const before = JSON.stringify(oldState);
    const after = JSON.stringify(this.getState());
    return before !== after;
  }
  setState(nextState, initial = false) {
    const state = this.getState();
    const {
      action,
      index,
      lifecycle,
      origin = null,
      size,
      status
    } = {
      ...state,
      ...nextState
    };
    this.store.set("action", action);
    this.store.set("index", index);
    this.store.set("lifecycle", lifecycle);
    this.store.set("origin", origin);
    this.store.set("size", size);
    this.store.set("status", status);
    if (initial) {
      this.store.set("controlled", nextState.controlled);
      this.store.set("continuous", nextState.continuous);
    }
    if (this.listener && this.hasUpdatedState(state)) {
      this.listener(this.getState());
    }
  }
  getHelpers() {
    return {
      close: this.close,
      go: this.go,
      info: this.info,
      next: this.next,
      open: this.open,
      prev: this.prev,
      reset: this.reset,
      skip: this.skip
    };
  }
};
function createStore(options) {
  return new Store(options);
}

// src/components/Overlay.tsx
var import_react2 = require("react");
var import_tree_changes = __toESM(require("tree-changes"));

// src/components/Spotlight.tsx
var import_jsx_runtime = require("react/jsx-runtime");
function JoyrideSpotlight({ styles }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      className: "react-joyride__spotlight",
      "data-test-id": "spotlight",
      style: styles
    },
    "JoyrideSpotlight"
  );
}
var Spotlight_default = JoyrideSpotlight;

// src/components/Overlay.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
function JoyrideOverlay(props) {
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
    target
  } = props;
  const [isScrolling, setIsScrolling] = (0, import_react2.useState)(false);
  const [mouseOverSpotlight, setMouseOverSpotlight] = (0, import_react2.useState)(false);
  const [showSpotlight, setShowSpotlight] = (0, import_react2.useState)(true);
  const [, setForceRender] = (0, import_react2.useState)(0);
  const isActiveRef = (0, import_react2.useRef)(false);
  const resizeTimeoutRef = (0, import_react2.useRef)(void 0);
  const scrollTimeoutRef = (0, import_react2.useRef)(void 0);
  const scrollParentRef = (0, import_react2.useRef)(void 0);
  const previousPropsRef = (0, import_react2.useRef)(props);
  const getSpotlightStyles = (0, import_react2.useCallback)(() => {
    var _a, _b, _c;
    const element = getElement(target);
    const elementRect = getClientRect(element);
    const isFixedTarget = hasPosition(element);
    const top = getElementPosition(element, spotlightPadding, disableScrollParentFix);
    return {
      ...styles.spotlight,
      height: Math.round(((_a = elementRect == null ? void 0 : elementRect.height) != null ? _a : 0) + spotlightPadding * 2),
      left: Math.round(((_b = elementRect == null ? void 0 : elementRect.left) != null ? _b : 0) - spotlightPadding),
      opacity: showSpotlight ? 1 : 0,
      pointerEvents: spotlightClicks ? "none" : "auto",
      position: isFixedTarget ? "fixed" : "absolute",
      top,
      transition: "opacity 0.2s",
      width: Math.round(((_c = elementRect == null ? void 0 : elementRect.width) != null ? _c : 0) + spotlightPadding * 2)
    };
  }, [target, spotlightPadding, disableScrollParentFix, styles.spotlight, showSpotlight, spotlightClicks]);
  const handleMouseMove = (0, import_react2.useCallback)((event) => {
    const spotStyles = getSpotlightStyles();
    const { height, left, position, top, width } = spotStyles;
    const offsetY = position === "fixed" ? event.clientY : event.pageY;
    const offsetX = position === "fixed" ? event.clientX : event.pageX;
    const inSpotlightHeight = offsetY >= top && offsetY <= top + height;
    const inSpotlightWidth = offsetX >= left && offsetX <= left + width;
    const inSpotlight = inSpotlightWidth && inSpotlightHeight;
    setMouseOverSpotlight((prev) => {
      if (inSpotlight !== prev) {
        return inSpotlight;
      }
      return prev;
    });
  }, [getSpotlightStyles]);
  const handleScroll = (0, import_react2.useCallback)(() => {
    const element = getElement(target);
    if (scrollParentRef.current !== document) {
      setIsScrolling((prev) => {
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
    } else if (hasPosition(element, "sticky")) {
      setForceRender((c) => c + 1);
    }
  }, [target]);
  const handleResize = (0, import_react2.useCallback)(() => {
    clearTimeout(resizeTimeoutRef.current);
    resizeTimeoutRef.current = window.setTimeout(() => {
      if (isActiveRef.current) {
        setForceRender((c) => c + 1);
      }
    }, 100);
  }, []);
  (0, import_react2.useEffect)(() => {
    const element = getElement(target);
    scrollParentRef.current = getScrollParent(element != null ? element : document.body, disableScrollParentFix, true);
    isActiveRef.current = true;
    if (process.env.NODE_ENV !== "production") {
      if (!disableScrolling && hasCustomScrollParent(element, true)) {
        log({
          title: "step has a custom scroll parent and can cause trouble with scrolling",
          data: [{ key: "parent", value: scrollParentRef.current }],
          debug
        });
      }
    }
    window.addEventListener("resize", handleResize);
    return () => {
      var _a;
      isActiveRef.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeoutRef.current);
      clearTimeout(scrollTimeoutRef.current);
      (_a = scrollParentRef.current) == null ? void 0 : _a.removeEventListener("scroll", handleScroll);
    };
  }, []);
  (0, import_react2.useEffect)(() => {
    var _a;
    const previousProps = previousPropsRef.current;
    const { changed } = (0, import_tree_changes.default)(previousProps, props);
    if (changed("target") || changed("disableScrollParentFix")) {
      const element = getElement(target);
      scrollParentRef.current = getScrollParent(element != null ? element : document.body, disableScrollParentFix, true);
    }
    if (changed("lifecycle", LIFECYCLE.TOOLTIP)) {
      (_a = scrollParentRef.current) == null ? void 0 : _a.addEventListener("scroll", handleScroll, { passive: true });
      setTimeout(() => {
        if (!isScrolling) {
          setShowSpotlight(true);
        }
      }, 100);
    }
    if (changed("spotlightClicks") || changed("disableOverlay") || changed("lifecycle")) {
      if (spotlightClicks && lifecycle === LIFECYCLE.TOOLTIP) {
        window.addEventListener("mousemove", handleMouseMove, false);
      } else if (lifecycle !== LIFECYCLE.TOOLTIP) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
    }
    previousPropsRef.current = props;
  });
  const hideSpotlight = () => {
    const hiddenLifecycles = [
      LIFECYCLE.INIT,
      LIFECYCLE.BEACON,
      LIFECYCLE.COMPLETE,
      LIFECYCLE.ERROR
    ];
    return disableOverlay || (continuous ? hiddenLifecycles.includes(lifecycle) : lifecycle !== LIFECYCLE.TOOLTIP);
  };
  if (hideSpotlight()) {
    return null;
  }
  const spotlightStyles = getSpotlightStyles();
  const overlayStyles = {
    cursor: disableOverlayClose ? "default" : "pointer",
    height: getDocumentHeight(),
    pointerEvents: mouseOverSpotlight ? "none" : "auto",
    ...styles.overlay
  };
  let spotlight2 = placement !== "center" && showSpotlight && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Spotlight_default, { styles: spotlightStyles });
  if (isSafari()) {
    const { mixBlendMode, zIndex, ...safariOverlay } = overlayStyles;
    spotlight2 = /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { ...safariOverlay }, children: spotlight2 });
    delete overlayStyles.backgroundColor;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    "div",
    {
      className: "react-joyride__overlay",
      "data-test-id": "overlay",
      onClick: onClickOverlay,
      role: "presentation",
      style: overlayStyles,
      children: spotlight2
    }
  );
}

// src/components/Portal.tsx
var import_react3 = require("react");
var import_react_dom = require("react-dom");
function JoyridePortal({ children, id }) {
  const nodeRef = (0, import_react3.useRef)(null);
  (0, import_react3.useEffect)(() => {
    if (!canUseDOM()) {
      return;
    }
    const node = document.createElement("div");
    node.id = id;
    document.body.appendChild(node);
    nodeRef.current = node;
    return () => {
      if (node.parentNode === document.body) {
        document.body.removeChild(node);
      }
      nodeRef.current = null;
    };
  }, [id]);
  if (!canUseDOM() || !nodeRef.current) {
    return null;
  }
  return (0, import_react_dom.createPortal)(children, nodeRef.current);
}

// src/components/Step.tsx
var import_react5 = require("react");
var import_react_floater = __toESM(require("react-floater"));
var import_is_lite5 = __toESM(require("is-lite"));
var import_tree_changes2 = __toESM(require("tree-changes"));

// src/modules/scope.ts
var Scope = class {
  constructor(element, options) {
    this.canBeTabbed = (element) => {
      const { tabIndex } = element;
      if (tabIndex === null || tabIndex < 0) {
        return false;
      }
      return this.canHaveFocus(element);
    };
    this.canHaveFocus = (element) => {
      const validTabNodes = /input|select|textarea|button|object/;
      const nodeName = element.nodeName.toLowerCase();
      const isValid = validTabNodes.test(nodeName) && !element.getAttribute("disabled") || nodeName === "a" && !!element.getAttribute("href");
      return isValid && this.isVisible(element);
    };
    this.findValidTabElements = () => [].slice.call(this.element.querySelectorAll("*"), 0).filter(this.canBeTabbed);
    this.handleKeyDown = (event) => {
      const { code = "Tab" } = this.options;
      if (event.code === code) {
        this.interceptTab(event);
      }
    };
    this.interceptTab = (event) => {
      event.preventDefault();
      const elements = this.findValidTabElements();
      const { shiftKey } = event;
      if (!elements.length) {
        return;
      }
      let x = document.activeElement ? elements.indexOf(document.activeElement) : 0;
      if (x === -1 || !shiftKey && x + 1 === elements.length) {
        x = 0;
      } else if (shiftKey && x === 0) {
        x = elements.length - 1;
      } else {
        x += shiftKey ? -1 : 1;
      }
      elements[x].focus();
    };
    // eslint-disable-next-line class-methods-use-this
    this.isHidden = (element) => {
      const noSize = element.offsetWidth <= 0 && element.offsetHeight <= 0;
      const style = window.getComputedStyle(element);
      if (noSize && !element.innerHTML) {
        return true;
      }
      return noSize && style.getPropertyValue("overflow") !== "visible" || style.getPropertyValue("display") === "none";
    };
    this.isVisible = (element) => {
      let parentElement = element;
      while (parentElement) {
        if (parentElement instanceof HTMLElement) {
          if (parentElement === document.body) {
            break;
          }
          if (this.isHidden(parentElement)) {
            return false;
          }
          parentElement = parentElement.parentNode;
        }
      }
      return true;
    };
    this.removeScope = () => {
      window.removeEventListener("keydown", this.handleKeyDown);
    };
    this.checkFocus = (target) => {
      if (document.activeElement !== target) {
        target.focus();
        window.requestAnimationFrame(() => this.checkFocus(target));
      }
    };
    this.setFocus = () => {
      const { selector } = this.options;
      if (!selector) {
        return;
      }
      const target = this.element.querySelector(selector);
      if (target) {
        window.requestAnimationFrame(() => this.checkFocus(target));
      }
    };
    if (!(element instanceof HTMLElement)) {
      throw new TypeError("Invalid parameter: element must be an HTMLElement");
    }
    this.element = element;
    this.options = options;
    window.addEventListener("keydown", this.handleKeyDown, false);
    this.setFocus();
  }
};

// src/components/Beacon.tsx
var import_react4 = require("react");
var import_is_lite4 = __toESM(require("is-lite"));
var import_jsx_runtime3 = require("react/jsx-runtime");
function JoyrideBeacon(props) {
  const {
    beaconComponent,
    continuous,
    index,
    isLastStep,
    locale,
    nonce,
    onClickOrHover,
    shouldFocus,
    size,
    step,
    styles
  } = props;
  const beaconRef = (0, import_react4.useRef)(null);
  const setBeaconRef = (0, import_react4.useCallback)((c) => {
    beaconRef.current = c;
  }, []);
  (0, import_react4.useEffect)(() => {
    if (beaconComponent) {
      return;
    }
    const head = document.head || document.getElementsByTagName("head")[0];
    const style = document.createElement("style");
    style.id = "joyride-beacon-animation";
    if (nonce) {
      style.setAttribute("nonce", nonce);
    }
    const css = `
        @keyframes joyride-beacon-inner {
          20% {
            opacity: 0.9;
          }

          90% {
            opacity: 0.7;
          }
        }

        @keyframes joyride-beacon-outer {
          0% {
            transform: scale(1);
          }

          45% {
            opacity: 0.7;
            transform: scale(0.75);
          }

          100% {
            opacity: 0.9;
            transform: scale(1);
          }
        }
      `;
    style.appendChild(document.createTextNode(css));
    head.appendChild(style);
    return () => {
      const existingStyle = document.getElementById("joyride-beacon-animation");
      if (existingStyle == null ? void 0 : existingStyle.parentNode) {
        existingStyle.parentNode.removeChild(existingStyle);
      }
    };
  }, [beaconComponent, nonce]);
  (0, import_react4.useEffect)(() => {
    if (process.env.NODE_ENV !== "production") {
      if (!import_is_lite4.default.domElement(beaconRef.current)) {
        console.warn("beacon is not a valid DOM element");
      }
    }
    setTimeout(() => {
      if (import_is_lite4.default.domElement(beaconRef.current) && shouldFocus) {
        beaconRef.current.focus();
      }
    }, 0);
  }, [shouldFocus]);
  const title = getReactNodeText(locale.open);
  const sharedProps = {
    "aria-label": title,
    onClick: onClickOrHover,
    onMouseEnter: onClickOrHover,
    ref: setBeaconRef,
    title
  };
  if (beaconComponent) {
    const BeaconComponent = beaconComponent;
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      BeaconComponent,
      {
        continuous,
        index,
        isLastStep,
        size,
        step,
        ...sharedProps
      }
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "button",
    {
      className: "react-joyride__beacon",
      "data-test-id": "button-beacon",
      style: styles.beacon,
      type: "button",
      ...sharedProps,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: styles.beaconInner }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: styles.beaconOuter })
      ]
    },
    "JoyrideBeacon"
  );
}

// src/components/Tooltip/CloseButton.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
function JoyrideTooltipCloseButton({ styles, ...props }) {
  const { color, height, width, ...style } = styles;
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { style, type: "button", ...props, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
    "svg",
    {
      height: typeof height === "number" ? `${height}px` : height,
      preserveAspectRatio: "xMidYMid",
      version: "1.1",
      viewBox: "0 0 18 18",
      width: typeof width === "number" ? `${width}px` : width,
      xmlns: "http://www.w3.org/2000/svg",
      children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("g", { children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "path",
        {
          d: "M8.13911129,9.00268191 L0.171521827,17.0258467 C-0.0498027049,17.248715 -0.0498027049,17.6098394 0.171521827,17.8327545 C0.28204354,17.9443526 0.427188206,17.9998706 0.572051765,17.9998706 C0.71714958,17.9998706 0.862013139,17.9443526 0.972581703,17.8327545 L9.0000937,9.74924618 L17.0276057,17.8327545 C17.1384085,17.9443526 17.2832721,17.9998706 17.4281356,17.9998706 C17.5729992,17.9998706 17.718097,17.9443526 17.8286656,17.8327545 C18.0499901,17.6098862 18.0499901,17.2487618 17.8286656,17.0258467 L9.86135722,9.00268191 L17.8340066,0.973848225 C18.0553311,0.750979934 18.0553311,0.389855532 17.8340066,0.16694039 C17.6126821,-0.0556467968 17.254037,-0.0556467968 17.0329467,0.16694039 L9.00042166,8.25611765 L0.967006424,0.167268345 C0.745681892,-0.0553188426 0.387317931,-0.0553188426 0.165993399,0.167268345 C-0.0553311331,0.390136635 -0.0553311331,0.751261038 0.165993399,0.974176179 L8.13920499,9.00268191 L8.13911129,9.00268191 Z",
          fill: color
        }
      ) })
    }
  ) });
}
var CloseButton_default = JoyrideTooltipCloseButton;

// src/components/Tooltip/Container.tsx
var import_jsx_runtime5 = require("react/jsx-runtime");
function JoyrideTooltipContainer(props) {
  const { backProps, closeProps, index, isLastStep, primaryProps, skipProps, step, tooltipProps } = props;
  const { content, hideBackButton, hideCloseButton, hideFooter, showSkipButton, styles, title } = step;
  const output = {};
  output.primary = /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
    "button",
    {
      "data-test-id": "button-primary",
      style: styles.buttonNext,
      type: "button",
      ...primaryProps
    }
  );
  if (showSkipButton && !isLastStep) {
    output.skip = /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      "button",
      {
        "aria-live": "off",
        "data-test-id": "button-skip",
        style: styles.buttonSkip,
        type: "button",
        ...skipProps
      }
    );
  }
  if (!hideBackButton && index > 0) {
    output.back = /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { "data-test-id": "button-back", style: styles.buttonBack, type: "button", ...backProps });
  }
  output.close = !hideCloseButton && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(CloseButton_default, { "data-test-id": "button-close", styles: styles.buttonClose, ...closeProps });
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
    "div",
    {
      "aria-label": getReactNodeText(title != null ? title : content),
      className: "react-joyride__tooltip",
      style: styles.tooltip,
      ...tooltipProps,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: styles.tooltipContainer, children: [
          title && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h1", { "aria-label": getReactNodeText(title), style: styles.tooltipTitle, children: title }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: styles.tooltipContent, children: content })
        ] }),
        !hideFooter && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: styles.tooltipFooter, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: styles.tooltipFooterSpacer, children: output.skip }),
          output.back,
          output.primary
        ] }),
        output.close
      ]
    },
    "JoyrideTooltip"
  );
}
var Container_default = JoyrideTooltipContainer;

// src/components/Tooltip/index.tsx
var import_jsx_runtime6 = require("react/jsx-runtime");
function JoyrideTooltip(props) {
  const { continuous, helpers, index, isLastStep, setTooltipRef, size, step } = props;
  const handleClickBack = (event) => {
    event.preventDefault();
    helpers.prev();
  };
  const handleClickClose = (event) => {
    event.preventDefault();
    helpers.close("button_close");
  };
  const handleClickPrimary = (event) => {
    event.preventDefault();
    if (!continuous) {
      helpers.close("button_primary");
      return;
    }
    helpers.next();
  };
  const handleClickSkip = (event) => {
    event.preventDefault();
    helpers.skip();
  };
  const getElementsProps = () => {
    const { back, close, last, next, nextLabelWithProgress, skip } = step.locale;
    const backText = getReactNodeText(back);
    const closeText = getReactNodeText(close);
    const lastText = getReactNodeText(last);
    const nextText = getReactNodeText(next);
    const skipText = getReactNodeText(skip);
    let primary = close;
    let primaryText = closeText;
    if (continuous) {
      primary = next;
      primaryText = nextText;
      if (step.showProgress && !isLastStep) {
        const labelWithProgress = getReactNodeText(nextLabelWithProgress, {
          step: index + 1,
          steps: size
        });
        primary = replaceLocaleContent(nextLabelWithProgress, index + 1, size);
        primaryText = labelWithProgress;
      }
      if (isLastStep) {
        primary = last;
        primaryText = lastText;
      }
    }
    return {
      backProps: {
        "aria-label": backText,
        children: back,
        "data-action": "back",
        onClick: handleClickBack,
        role: "button",
        title: backText
      },
      closeProps: {
        "aria-label": closeText,
        children: close,
        "data-action": "close",
        onClick: handleClickClose,
        role: "button",
        title: closeText
      },
      primaryProps: {
        "aria-label": primaryText,
        children: primary,
        "data-action": "primary",
        onClick: handleClickPrimary,
        role: "button",
        title: primaryText
      },
      skipProps: {
        "aria-label": skipText,
        children: skip,
        "data-action": "skip",
        onClick: handleClickSkip,
        role: "button",
        title: skipText
      },
      tooltipProps: {
        "aria-modal": true,
        ref: setTooltipRef,
        role: "alertdialog"
      }
    };
  };
  const { beaconComponent, tooltipComponent, ...cleanStep } = step;
  if (tooltipComponent) {
    const renderProps = {
      ...getElementsProps(),
      continuous,
      index,
      isLastStep,
      size,
      step: cleanStep,
      setTooltipRef
    };
    const TooltipComponent = tooltipComponent;
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(TooltipComponent, { ...renderProps });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
    Container_default,
    {
      ...getElementsProps(),
      continuous,
      index,
      isLastStep,
      size,
      step
    }
  );
}

// src/components/Step.tsx
var import_jsx_runtime7 = require("react/jsx-runtime");
function JoyrideStep(props) {
  var _a;
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
    shouldScroll: shouldScroll2,
    size,
    status,
    step,
    store
  } = props;
  const scopeRef = (0, import_react5.useRef)(null);
  const tooltipRef = (0, import_react5.useRef)(null);
  const previousPropsRef = (0, import_react5.useRef)(props);
  const setTooltipRef = (0, import_react5.useCallback)((element) => {
    tooltipRef.current = element;
  }, []);
  const handleClickHoverBeacon = (0, import_react5.useCallback)((event) => {
    if (event.type === "mouseenter" && step.event !== "hover") {
      return;
    }
    store.update({ lifecycle: LIFECYCLE.TOOLTIP });
  }, [step.event, store]);
  const setPopper = (0, import_react5.useCallback)((popper, type) => {
    var _a2;
    if (type === "wrapper") {
      store.setPopper("beacon", popper);
    } else {
      store.setPopper("tooltip", popper);
    }
    if (store.getPopper("beacon") && (store.getPopper("tooltip") || step.placement === "center") && lifecycle === LIFECYCLE.INIT) {
      store.update({
        action,
        lifecycle: LIFECYCLE.READY
      });
    }
    if ((_a2 = step.floaterProps) == null ? void 0 : _a2.getPopper) {
      step.floaterProps.getPopper(popper, type);
    }
  }, [action, lifecycle, step.placement, step.floaterProps, store]);
  (0, import_react5.useEffect)(() => {
    log({
      title: `step:${index}`,
      data: [{ key: "props", value: props }],
      debug
    });
  }, []);
  (0, import_react5.useEffect)(() => {
    return () => {
      var _a2;
      (_a2 = scopeRef.current) == null ? void 0 : _a2.removeScope();
    };
  }, []);
  (0, import_react5.useEffect)(() => {
    var _a2;
    const previousProps = previousPropsRef.current;
    const { changed, changedFrom } = (0, import_tree_changes2.default)(previousProps, props);
    const state = helpers.info();
    const skipBeacon = continuous && action !== ACTIONS.CLOSE && (index > 0 || action === ACTIONS.PREV);
    const hasStoreChanged = changed("action") || changed("index") || changed("lifecycle") || changed("status");
    const isInitial = changedFrom("lifecycle", [LIFECYCLE.TOOLTIP, LIFECYCLE.INIT], LIFECYCLE.INIT);
    const isAfterAction = changed("action", [
      ACTIONS.NEXT,
      ACTIONS.PREV,
      ACTIONS.SKIP,
      ACTIONS.CLOSE
    ]);
    const isControlled = controlled && index === previousProps.index;
    if (isAfterAction && (isInitial || isControlled)) {
      callback({
        ...state,
        index: previousProps.index,
        lifecycle: LIFECYCLE.COMPLETE,
        step: previousProps.step,
        type: EVENTS.STEP_AFTER
      });
    }
    if (step.placement === "center" && status === STATUS.RUNNING && changed("index") && action !== ACTIONS.START && lifecycle === LIFECYCLE.INIT) {
      store.update({ lifecycle: LIFECYCLE.READY });
    }
    if (hasStoreChanged) {
      const element = getElement(step.target);
      const elementExists = !!element;
      const hasRenderedTarget = elementExists && isElementVisible(element);
      if (hasRenderedTarget) {
        if (changedFrom("status", STATUS.READY, STATUS.RUNNING) || changedFrom("lifecycle", LIFECYCLE.INIT, LIFECYCLE.READY)) {
          callback({
            ...state,
            step,
            type: EVENTS.STEP_BEFORE
          });
        }
      } else {
        console.warn(elementExists ? "Target not visible" : "Target not mounted", step);
        callback({
          ...state,
          type: EVENTS.TARGET_NOT_FOUND,
          step
        });
        if (!controlled) {
          store.update({ index: index + (action === ACTIONS.PREV ? -1 : 1) });
        }
      }
    }
    if (changedFrom("lifecycle", LIFECYCLE.INIT, LIFECYCLE.READY)) {
      store.update({
        lifecycle: hideBeacon(step) || skipBeacon ? LIFECYCLE.TOOLTIP : LIFECYCLE.BEACON
      });
    }
    if (changed("index")) {
      log({
        title: `step:${lifecycle}`,
        data: [{ key: "props", value: props }],
        debug
      });
    }
    if (changed("lifecycle", LIFECYCLE.BEACON)) {
      callback({
        ...state,
        step,
        type: EVENTS.BEACON
      });
    }
    if (changed("lifecycle", LIFECYCLE.TOOLTIP)) {
      callback({
        ...state,
        step,
        type: EVENTS.TOOLTIP
      });
      if (shouldScroll2 && tooltipRef.current) {
        scopeRef.current = new Scope(tooltipRef.current, { selector: "[data-action=primary]" });
        scopeRef.current.setFocus();
      }
    }
    if (changedFrom("lifecycle", [LIFECYCLE.TOOLTIP, LIFECYCLE.INIT], LIFECYCLE.INIT)) {
      (_a2 = scopeRef.current) == null ? void 0 : _a2.removeScope();
      store.cleanupPoppers();
    }
    previousPropsRef.current = props;
  });
  const target = getElement(step.target);
  if (!validateStep(step) || !import_is_lite5.default.domElement(target)) {
    return null;
  }
  const isOpen = hideBeacon(step) || lifecycle === LIFECYCLE.TOOLTIP;
  const TooltipComponent = () => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
    JoyrideTooltip,
    {
      continuous,
      helpers,
      index,
      isLastStep: index + 1 === size,
      setTooltipRef,
      size,
      step
    }
  );
  const { content: _c, component: _comp, ...safeFloaterProps } = (_a = step.floaterProps) != null ? _a : {};
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "react-joyride__step", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
    import_react_floater.default,
    {
      ...safeFloaterProps,
      component: TooltipComponent,
      debug,
      getPopper: setPopper,
      id: `react-joyride-step-${index}`,
      open: isOpen,
      placement: step.placement,
      target: step.target,
      children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
        JoyrideBeacon,
        {
          beaconComponent: step.beaconComponent,
          continuous,
          index,
          isLastStep: index + 1 === size,
          locale: step.locale,
          nonce,
          onClickOrHover: handleClickHoverBeacon,
          shouldFocus: shouldScroll2,
          size,
          step,
          styles: step.styles
        }
      )
    }
  ) }, `JoyrideStep-${index}`);
}

// src/components/index.tsx
var import_jsx_runtime8 = require("react/jsx-runtime");
var defaultPropsValues = {
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
  steps: []
};
function Joyride(inputProps) {
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
    steps
  } = props;
  const storeRef = (0, import_react6.useRef)(
    createStore({
      ...props,
      controlled: run && import_is_lite6.default.number(stepIndex)
    })
  );
  const helpersRef = (0, import_react6.useRef)(storeRef.current.getHelpers());
  const [state, setState] = (0, import_react6.useState)(storeRef.current.getState());
  const previousStateRef = (0, import_react6.useRef)(state);
  const previousPropsRef = (0, import_react6.useRef)(props);
  const mountedRef = (0, import_react6.useRef)(false);
  const store = storeRef.current;
  const helpers = helpersRef.current;
  const triggerCallback = (0, import_react6.useCallback)(
    (data) => {
      if (import_is_lite6.default.function(callbackProp)) {
        callbackProp(data);
      }
    },
    [callbackProp]
  );
  const handleKeyboard = (0, import_react6.useCallback)(
    (event) => {
      const { index: currentIndex, lifecycle: lifecycle2 } = storeRef.current.getState();
      const currentSteps = props.steps;
      const currentStep = currentSteps[currentIndex];
      if (lifecycle2 === LIFECYCLE.TOOLTIP) {
        if (event.code === "Escape" && currentStep && !currentStep.disableCloseOnEsc) {
          storeRef.current.close("keyboard");
        }
      }
    },
    [props.steps]
  );
  const handleClickOverlay = (0, import_react6.useCallback)(() => {
    const currentState = storeRef.current.getState();
    const step = getMergedStep(props, steps[currentState.index]);
    if (!step.disableOverlayClose) {
      helpers.close("overlay");
    }
  }, [props, steps, helpers]);
  (0, import_react6.useEffect)(() => {
    store.addListener(setState);
    log({
      title: "init",
      data: [
        { key: "props", value: props },
        { key: "state", value: state }
      ],
      debug
    });
    if (getHelpers) {
      getHelpers(helpers);
    }
  }, []);
  (0, import_react6.useEffect)(() => {
    if (!canUseDOM()) {
      return;
    }
    if (validateSteps(steps, debug) && run) {
      store.start();
    }
    if (!disableCloseOnEsc) {
      document.body.addEventListener("keydown", handleKeyboard, { passive: true });
    }
    mountedRef.current = true;
    return () => {
      if (!disableCloseOnEsc) {
        document.body.removeEventListener("keydown", handleKeyboard);
      }
    };
  }, []);
  (0, import_react6.useEffect)(() => {
    if (!mountedRef.current || !canUseDOM()) {
      return;
    }
    const previousProps = previousPropsRef.current;
    const { changedProps } = (0, import_tree_changes3.default)(previousProps, props);
    const changedPropsFn = (key) => {
      const prev = previousProps[key];
      const curr = props[key];
      return prev !== curr;
    };
    const stepsChanged = !(0, import_deep_equal.default)(previousProps.steps, steps);
    if (stepsChanged) {
      if (validateSteps(steps, debug)) {
        store.setSteps(steps);
      } else {
        console.warn("Steps are not valid", steps);
      }
    }
    if (changedPropsFn("run")) {
      if (run) {
        store.start(stepIndex);
      } else {
        store.stop();
      }
    }
    const stepIndexChanged = import_is_lite6.default.number(stepIndex) && changedPropsFn("stepIndex");
    if (stepIndexChanged) {
      const currentState = store.getState();
      let nextAction = import_is_lite6.default.number(previousProps.stepIndex) && previousProps.stepIndex < stepIndex ? ACTIONS.NEXT : ACTIONS.PREV;
      if (currentState.action === ACTIONS.STOP) {
        nextAction = ACTIONS.START;
      }
      if (![STATUS.FINISHED, STATUS.SKIPPED].includes(currentState.status)) {
        store.update({
          action: currentState.action === ACTIONS.CLOSE ? ACTIONS.CLOSE : nextAction,
          index: stepIndex,
          lifecycle: LIFECYCLE.INIT
        });
      }
    }
    previousPropsRef.current = props;
  });
  (0, import_react6.useEffect)(() => {
    if (!mountedRef.current || !canUseDOM()) {
      return;
    }
    const previousState = previousStateRef.current;
    const { action, controlled, index: index2, lifecycle: lifecycle2, status: status2 } = state;
    const { changed, changedFrom } = (0, import_tree_changes3.default)(previousState, state);
    const step = getMergedStep(props, steps[index2]);
    const target = getElement(step.target);
    if (!controlled && status2 === STATUS.RUNNING && index2 === 0 && !target) {
      store.update({ index: index2 + 1 });
      triggerCallback({
        ...state,
        type: EVENTS.TARGET_NOT_FOUND,
        step
      });
    }
    const callbackData = {
      ...state,
      index: index2,
      step
    };
    const isAfterAction = changed("action", [
      ACTIONS.NEXT,
      ACTIONS.PREV,
      ACTIONS.SKIP,
      ACTIONS.CLOSE
    ]);
    if (isAfterAction && changed("status", STATUS.PAUSED)) {
      const previousStep = getMergedStep(props, steps[previousState.index]);
      triggerCallback({
        ...callbackData,
        index: previousState.index,
        lifecycle: LIFECYCLE.COMPLETE,
        step: previousStep,
        type: EVENTS.STEP_AFTER
      });
    }
    if (changed("status", [STATUS.FINISHED, STATUS.SKIPPED])) {
      const previousStep = getMergedStep(props, steps[previousState.index]);
      if (!controlled) {
        triggerCallback({
          ...callbackData,
          index: previousState.index,
          lifecycle: LIFECYCLE.COMPLETE,
          step: previousStep,
          type: EVENTS.STEP_AFTER
        });
      }
      triggerCallback({
        ...callbackData,
        type: EVENTS.TOUR_END,
        // Return the last step when the tour is finished
        step: previousStep,
        index: previousState.index
      });
      store.reset();
    } else if (changedFrom("status", [STATUS.IDLE, STATUS.READY], STATUS.RUNNING)) {
      triggerCallback({
        ...callbackData,
        type: EVENTS.TOUR_START
      });
    } else if (changed("status") || changed("action", ACTIONS.RESET)) {
      triggerCallback({
        ...callbackData,
        type: EVENTS.TOUR_STATUS
      });
    }
    scrollToStep(previousState);
    previousStateRef.current = state;
  });
  function scrollToStep(previousState) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
    const { index: index2, lifecycle: lifecycle2, status: status2 } = state;
    const {
      disableScrollParentFix = false
    } = props;
    const step = getMergedStep(props, steps[index2]);
    const target = getElement(step.target);
    const shouldScrollToStep = shouldScroll({
      isFirstStep: index2 === 0,
      lifecycle: lifecycle2,
      previousLifecycle: previousState.lifecycle,
      scrollToFirstStep,
      step,
      target
    });
    if (status2 === STATUS.RUNNING && shouldScrollToStep) {
      const hasCustomScroll = hasCustomScrollParent(target, disableScrollParentFix);
      const scrollParent2 = getScrollParent(target, disableScrollParentFix);
      let scrollY = Math.floor(getScrollTo(target, scrollOffset, disableScrollParentFix)) || 0;
      log({
        title: "scrollToStep",
        data: [
          { key: "index", value: index2 },
          { key: "lifecycle", value: lifecycle2 },
          { key: "status", value: status2 }
        ],
        debug
      });
      const beaconPopper = store.getPopper("beacon");
      const tooltipPopper = store.getPopper("tooltip");
      if (lifecycle2 === LIFECYCLE.BEACON && beaconPopper) {
        const placement = (_b = (_a = beaconPopper.state) == null ? void 0 : _a.placement) != null ? _b : "";
        const popperTop = (_f = (_e = (_d = (_c = beaconPopper.state) == null ? void 0 : _c.rects) == null ? void 0 : _d.popper) == null ? void 0 : _e.y) != null ? _f : 0;
        if (!["bottom"].includes(placement) && !hasCustomScroll) {
          scrollY = Math.floor(popperTop - scrollOffset);
        }
      } else if (lifecycle2 === LIFECYCLE.TOOLTIP && tooltipPopper) {
        const placement = (_h = (_g = tooltipPopper.state) == null ? void 0 : _g.placement) != null ? _h : "";
        const popperTop = (_l = (_k = (_j = (_i = tooltipPopper.state) == null ? void 0 : _i.rects) == null ? void 0 : _j.popper) == null ? void 0 : _k.y) != null ? _l : 0;
        const flipped = ((_o = (_n = (_m = tooltipPopper.state) == null ? void 0 : _m.modifiersData) == null ? void 0 : _n.flip) == null ? void 0 : _o.overflows) != null;
        if (["top", "right", "left"].includes(placement) && !flipped && !hasCustomScroll) {
          scrollY = Math.floor(popperTop - scrollOffset);
        } else {
          scrollY -= step.spotlightPadding;
        }
      }
      scrollY = scrollY >= 0 ? scrollY : 0;
      if (status2 === STATUS.RUNNING) {
        scrollTo(scrollY, { element: scrollParent2, duration: scrollDuration }).then(
          () => {
            setTimeout(() => {
              var _a2;
              (_a2 = store.getPopper("tooltip")) == null ? void 0 : _a2.update();
            }, 10);
          }
        );
      }
    }
  }
  if (!canUseDOM()) {
    return null;
  }
  const { index, lifecycle, status } = state;
  const isRunning = status === STATUS.RUNNING;
  const content = {};
  if (isRunning && steps[index]) {
    const step = getMergedStep(props, steps[index]);
    content.step = /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      JoyrideStep,
      {
        ...state,
        callback: triggerCallback,
        continuous,
        debug,
        helpers,
        nonce,
        shouldScroll: !step.disableScrolling && (index !== 0 || scrollToFirstStep),
        step,
        store
      }
    );
    content.overlay = /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(JoyridePortal, { id: "react-joyride-portal", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      JoyrideOverlay,
      {
        ...step,
        continuous,
        debug,
        lifecycle,
        onClickOverlay: handleClickOverlay
      }
    ) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "react-joyride", children: [
    content.step,
    content.overlay
  ] });
}
var components_default = Joyride;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ACTIONS,
  EVENTS,
  LIFECYCLE,
  ORIGIN,
  STATUS
});
//# sourceMappingURL=index.js.map