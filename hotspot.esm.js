/*!
 * Hotspot v1.0.0 — ES module build
 * Auto-generated from hotspot.js by build.js — do not edit directly.
 * Apache 2.0 License
 */


  // ---------------------------------------------------------------------
  // Defaults — overridable globally via Hotspot.configure({...})
  // ---------------------------------------------------------------------
  var defaults = {
    container: '#diagram',
    color: 'teal',        // built-in: 'teal' | 'orange' | 'purple' | 'red' | 'blue' | any custom string you theme via CSS
    popupWidth: 250,
    popupGap: 14,          // px gap between the dot and the popup
    closeOnOutsideClick: true,
    closeOnEscape: true
  };

  var idCounter = 0;
  var registry = Object.create(null); // id -> { hotspotEl, popupEl, options }
  var boundContainers = new WeakSet();

  // ---------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------
  function resolveContainer(sel) {
    if (typeof sel === 'string') return document.querySelector(sel);
    if (sel instanceof Element) return sel;
    return null;
  }

  function closeAll(exceptId) {
    Object.keys(registry).forEach(function (id) {
      if (id === String(exceptId)) return;
      var entry = registry[id];
      entry.popupEl.classList.remove('active');
      entry.hotspotEl.classList.remove('open');
      entry.hotspotEl.setAttribute('aria-expanded', 'false');
    });
  }

  function isOpen(entry) {
    return entry.popupEl.classList.contains('active');
  }

  function openPopup(entry) {
    closeAll(entry.id);
    entry.popupEl.classList.add('active');
    entry.hotspotEl.classList.add('open');
    entry.hotspotEl.setAttribute('aria-expanded', 'true');
    positionPopup(entry);
    // move focus into the popup for keyboard/screen-reader users
    var closeBtn = entry.popupEl.querySelector('.hotspot-close');
    if (closeBtn) closeBtn.focus();
  }

  function closePopup(entry, returnFocus) {
    entry.popupEl.classList.remove('active');
    entry.hotspotEl.classList.remove('open');
    entry.hotspotEl.setAttribute('aria-expanded', 'false');
    if (returnFocus) entry.hotspotEl.focus();
  }

  function toggle(entry) {
    if (isOpen(entry)) {
      closePopup(entry, false);
    } else {
      openPopup(entry);
    }
  }

  // Flip the popup left/up if it would otherwise run off-screen.
  // Runs after the popup is visible so we can measure its real size.
  function positionPopup(entry) {
    var popup = entry.popupEl;
    var container = entry.containerEl;
    var containerRect = container.getBoundingClientRect();
    var x = entry.x;
    var y = entry.y;
    var gap = entry.options.popupGap;

    // reset to default (right/below) before measuring
    popup.style.left = x + 'px';
    popup.style.top = (y + gap) + 'px';
    popup.style.right = '';
    popup.style.bottom = '';
    popup.classList.remove('flip-x', 'flip-y');

    var popupRect = popup.getBoundingClientRect();

    var overflowsRight = popupRect.right > containerRect.right;
    var overflowsBottom = popupRect.bottom > containerRect.bottom;

    if (overflowsRight) {
      popup.style.left = 'auto';
      popup.style.right = (containerRect.width - x) + 'px';
      popup.classList.add('flip-x');
    }
    if (overflowsBottom) {
      popup.style.top = 'auto';
      popup.style.bottom = (containerRect.height - y + gap) + 'px';
      popup.classList.add('flip-y');
    }
  }

  // ---------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------

  /**
   * Set library-wide defaults. Merge-only — call multiple times safely.
   * @param {Object} opts
   */
  function configure(opts) {
    Object.keys(opts || {}).forEach(function (key) {
      defaults[key] = opts[key];
    });
  }

  /**
   * Create one hotspot + popup.
   *
   * Accepts either:
   *   makeHotspot({ x, y, heading, body, ...options })
   * or the legacy positional form:
   *   makeHotspot(x, y, heading, body)
   *
   * @returns {string} id — pass to removeHotspot/updateHotspot
   */
  function makeHotspot(a, b, c, d) {
    var opts;
    if (typeof a === 'object' && a !== null) {
      opts = a;
    } else {
      opts = { x: a, y: b, heading: c, body: d };
    }

    var merged = {};
    Object.keys(defaults).forEach(function (k) { merged[k] = defaults[k]; });
    Object.keys(opts).forEach(function (k) { merged[k] = opts[k]; });

    if (typeof merged.x !== 'number' || typeof merged.y !== 'number') {
      throw new Error('Hotspot: x and y are required numbers.');
    }

    var containerEl = resolveContainer(merged.container);
    if (!containerEl) {
      throw new Error('Hotspot: container "' + merged.container + '" not found.');
    }
    // container must be a positioning context for the absolutely-positioned children
    var computedPosition = window.getComputedStyle(containerEl).position;
    if (computedPosition === 'static') {
      containerEl.style.position = 'relative';
    }

    idCounter += 1;
    var id = 'hs-' + idCounter;

    var hotspotEl = document.createElement('button');
    hotspotEl.type = 'button';
    hotspotEl.className = 'hotspot hotspot-' + merged.color;
    hotspotEl.id = 'spot-' + id;
    hotspotEl.style.top = merged.y + 'px';
    hotspotEl.style.left = merged.x + 'px';
    hotspotEl.setAttribute('aria-expanded', 'false');
    hotspotEl.setAttribute('aria-controls', 'popup-' + id);
    hotspotEl.setAttribute('aria-label', merged.heading ? ('Show info: ' + merged.heading) : 'Show info');

    var popupEl = document.createElement('div');
    popupEl.className = 'popup';
    popupEl.id = 'popup-' + id;
    popupEl.setAttribute('role', 'dialog');
    popupEl.setAttribute('aria-modal', 'false');
    popupEl.setAttribute('aria-labelledby', 'heading-' + id);
    popupEl.style.width = merged.popupWidth + 'px';
    popupEl.style.top = (merged.y + merged.popupGap) + 'px';
    popupEl.style.left = merged.x + 'px';

    var headingHtml = merged.heading != null ? merged.heading : '';
    var bodyHtml = merged.body != null ? merged.body : '';

    popupEl.innerHTML =
      '<button type="button" class="hotspot-close" aria-label="Close">&times;</button>' +
      '<h3 id="heading-' + id + '">' + headingHtml + '</h3>' +
      '<div class="hotspot-body">' + bodyHtml + '</div>';

    containerEl.appendChild(hotspotEl);
    containerEl.appendChild(popupEl);

    var entry = {
      id: id,
      x: merged.x,
      y: merged.y,
      options: merged,
      containerEl: containerEl,
      hotspotEl: hotspotEl,
      popupEl: popupEl
    };
    registry[id] = entry;

    hotspotEl.addEventListener('click', function (e) {
      e.stopPropagation();
      toggle(entry);
    });

    popupEl.querySelector('.hotspot-close').addEventListener('click', function (e) {
      e.stopPropagation();
      closePopup(entry, true);
    });

    // Escape closes the focused hotspot's popup
    if (merged.closeOnEscape) {
      popupEl.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          closePopup(entry, true);
        }
      });
    }

    bindContainerOutsideClick(containerEl, merged.closeOnOutsideClick);

    return id;
  }

  function bindContainerOutsideClick(containerEl, enabled) {
    if (!enabled || boundContainers.has(containerEl)) return;
    boundContainers.add(containerEl);
    containerEl.addEventListener('click', function (e) {
      if (!e.target.closest('.hotspot') && !e.target.closest('.popup')) {
        closeAll();
      }
    });
  }

  /**
   * Update an existing hotspot's heading/body/position without recreating it.
   * @param {string} id
   * @param {Object} changes - any of { x, y, heading, body }
   */
  function updateHotspot(id, changes) {
    var entry = registry[id];
    if (!entry) return false;
    changes = changes || {};

    if (typeof changes.x === 'number' || typeof changes.y === 'number') {
      entry.x = typeof changes.x === 'number' ? changes.x : entry.x;
      entry.y = typeof changes.y === 'number' ? changes.y : entry.y;
      entry.hotspotEl.style.left = entry.x + 'px';
      entry.hotspotEl.style.top = entry.y + 'px';
      entry.popupEl.style.left = entry.x + 'px';
      entry.popupEl.style.top = (entry.y + entry.options.popupGap) + 'px';
    }
    if (changes.heading != null) {
      var h = entry.popupEl.querySelector('h3');
      if (h) h.innerHTML = changes.heading;
    }
    if (changes.body != null) {
      var b = entry.popupEl.querySelector('.hotspot-body');
      if (b) b.innerHTML = changes.body;
    }
    return true;
  }

  /**
   * Remove a single hotspot + its popup.
   * @param {string} id
   */
  function removeHotspot(id) {
    var entry = registry[id];
    if (!entry) return false;
    entry.hotspotEl.remove();
    entry.popupEl.remove();
    delete registry[id];
    return true;
  }

  /**
   * Remove every hotspot from a container (default: all containers used so far).
   * @param {string|Element} [container]
   */
  function clearHotspots(container) {
    var target = container ? resolveContainer(container) : null;
    Object.keys(registry).forEach(function (id) {
      var entry = registry[id];
      if (!target || entry.containerEl === target) {
        entry.hotspotEl.remove();
        entry.popupEl.remove();
        delete registry[id];
      }
    });
  }

  function getHotspot(id) {
    var entry = registry[id];
    if (!entry) return null;
    return { id: entry.id, x: entry.x, y: entry.y, hotspotEl: entry.hotspotEl, popupEl: entry.popupEl };
  }

  // Global Escape handler: closes whatever popup is open, from anywhere on the page
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    Object.keys(registry).some(function (id) {
      var entry = registry[id];
      if (isOpen(entry)) {
        closePopup(entry, true);
        return true;
      }
      return false;
    });
  });

  // Reposition open popups on resize so boundary-flipping stays correct
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      Object.keys(registry).forEach(function (id) {
        var entry = registry[id];
        if (isOpen(entry)) positionPopup(entry);
      });
    }, 100);
  });

  var api = {
    configure: configure,
    makeHotspot: makeHotspot,
    updateHotspot: updateHotspot,
    removeHotspot: removeHotspot,
    clearHotspots: clearHotspots,
    getHotspot: getHotspot,
    // legacy alias — matches the original template's function name
    makePopup: makeHotspot
  };

  return api;

export {
  configure,
  makeHotspot,
  updateHotspot,
  removeHotspot,
  clearHotspots,
  getHotspot,
  makePopup
};
export default api;
