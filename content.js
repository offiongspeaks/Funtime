(() => {
  'use strict';

  const HIDDEN_ATTRIBUTE = 'data-sponsored-pin-blocker-hidden';
  const SCANNED_ATTRIBUTE = 'data-sponsored-pin-blocker-scanned';
  const SCAN_DEBOUNCE_MS = 75;
  const MAX_TEXT_NODE_LENGTH = 120;
  const MAX_ANCESTOR_STEPS = 12;

  const SPONSOR_PATTERNS = [
    /^\s*sponsored\s*$/i,
    /\bsponsored\b/i,
    /\bpromoted\b/i,
    /\bpaid partnership\b/i,
    /\badvertisement\b/i
  ];

  const PIN_CONTAINER_SELECTORS = [
    '[data-test-id="pin"]',
    '[data-test-id="pinWrapper"]',
    '[data-grid-item]',
    'article',
    '[role="listitem"]'
  ];

  let pendingScan = null;
  const pendingRoots = new Set();

  const matchesSponsorText = (text) => {
    if (!text) {
      return false;
    }

    const normalizedText = text.replace(/\s+/g, ' ').trim();
    if (!normalizedText || normalizedText.length > MAX_TEXT_NODE_LENGTH) {
      return false;
    }

    return SPONSOR_PATTERNS.some((pattern) => pattern.test(normalizedText));
  };

  const isElement = (node) => node && node.nodeType === Node.ELEMENT_NODE;

  const getElementFromTextNode = (node) => {
    if (!node || node.nodeType !== Node.TEXT_NODE) {
      return null;
    }

    return node.parentElement;
  };

  const getPinContainer = (element) => {
    if (!isElement(element)) {
      return null;
    }

    const closestPinContainer = element.closest(PIN_CONTAINER_SELECTORS.join(','));
    if (closestPinContainer && closestPinContainer !== document.body && closestPinContainer !== document.documentElement) {
      return closestPinContainer;
    }

    let current = element;
    for (let steps = 0; current && steps < MAX_ANCESTOR_STEPS; steps += 1) {
      if (current.parentElement === document.body || current.parentElement === document.documentElement) {
        break;
      }

      const role = current.getAttribute('role');
      const testId = current.getAttribute('data-test-id') || '';
      const hasPinLikeMetadata = role === 'listitem' || /pin/i.test(testId) || current.hasAttribute('data-grid-item');

      if (hasPinLikeMetadata) {
        return current;
      }

      current = current.parentElement;
    }

    return null;
  };

  const hidePinContainer = (pinContainer) => {
    if (!pinContainer || pinContainer.hasAttribute(HIDDEN_ATTRIBUTE)) {
      return;
    }

    pinContainer.setAttribute(HIDDEN_ATTRIBUTE, 'true');
    pinContainer.setAttribute('aria-hidden', 'true');
  };

  const scanTextNodes = (root) => {
    if (!root || (!isElement(root) && root.nodeType !== Node.DOCUMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE)) {
      return;
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!matchesSponsorText(node.nodeValue)) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      }
    });

    let node = walker.nextNode();
    while (node) {
      const sponsorLabelElement = getElementFromTextNode(node);
      hidePinContainer(getPinContainer(sponsorLabelElement));
      node = walker.nextNode();
    }
  };

  const scanAttributeSignals = (root) => {
    if (!isElement(root) && root !== document) {
      return;
    }

    const candidates = [];
    if (isElement(root)) {
      candidates.push(root);
    }

    root.querySelectorAll?.('[aria-label], [title], [alt]').forEach((element) => candidates.push(element));

    candidates.forEach((element) => {
      const signalText = [
        element.getAttribute('aria-label'),
        element.getAttribute('title'),
        element.getAttribute('alt')
      ].filter(Boolean).join(' ');

      if (matchesSponsorText(signalText)) {
        hidePinContainer(getPinContainer(element));
      }
    });
  };

  const scan = (root = document) => {
    scanTextNodes(root);
    scanAttributeSignals(root);

    if (isElement(root)) {
      root.setAttribute(SCANNED_ATTRIBUTE, 'true');
    }
  };

  const scheduleScan = (root = document) => {
    pendingRoots.add(root);

    if (pendingScan) {
      return;
    }

    pendingScan = setTimeout(() => {
      pendingScan = null;
      const rootsToScan = [...pendingRoots];
      pendingRoots.clear();
      rootsToScan.forEach((pendingRoot) => scan(pendingRoot));
    }, SCAN_DEBOUNCE_MS);
  };

  const observePinterestFeed = () => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE && matchesSponsorText(node.nodeValue)) {
              hidePinContainer(getPinContainer(getElementFromTextNode(node)));
              return;
            }

            if (isElement(node) && !node.hasAttribute(SCANNED_ATTRIBUTE)) {
              scheduleScan(node);
            }
          });
        }

        if (mutation.type === 'characterData' && matchesSponsorText(mutation.target.nodeValue)) {
          hidePinContainer(getPinContainer(getElementFromTextNode(mutation.target)));
        }

        if (mutation.type === 'attributes' && isElement(mutation.target)) {
          const attributeValue = mutation.target.getAttribute(mutation.attributeName);
          if (matchesSponsorText(attributeValue)) {
            hidePinContainer(getPinContainer(mutation.target));
          }
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['aria-label', 'title', 'alt'],
      characterData: true,
      childList: true,
      subtree: true
    });
  };

  const start = () => {
    scan();
    observePinterestFeed();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
    scheduleScan();
  } else {
    start();
  }
})();
