/* ==========================================================================
   Resume.app — macOS-style window manager
   Vanilla JS. No frameworks, no build step.
   --------------------------------------------------------------------------
   Concepts:
     * "App"     — a logical section (about, skills, ...). Each app has one
                   .window element, identified by data-app="<id>".
     * "Open"    — the window is visible (not closed, not minimized).
     * "Active"  — the focused / front-most window. There is at most one.
     * Z-index   — incremented on every focus to bring a window to the front.
   ========================================================================== */

(function () {
  "use strict";

  /* ---------- Theme toggle (persisted in localStorage) ---------- */
  const STORAGE_KEY = "resume.theme";
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");

  const initialTheme = (() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "light" || saved === "dark") return saved;
    } catch (_) {
      /* ignore */
    }
    // Fall back to the user's OS preference, defaulting to dark.
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }
    return "dark";
  })();
  root.setAttribute("data-theme", initialTheme);

  themeToggle.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (_) {
      /* ignore */
    }
  });

  /* ---------- Menu bar clock ---------- */
  const clockEl = document.getElementById("menuClock");
  const updateClock = () => {
    const now = new Date();
    const opts = { weekday: "short", hour: "numeric", minute: "2-digit" };
    clockEl.textContent = now.toLocaleString(undefined, opts);
  };
  updateClock();
  setInterval(updateClock, 30 * 1000);

  /* ---------- Window registry ---------- */
  const desktop = document.getElementById("desktop");
  const dockList = document.getElementById("dockList");
  const activeAppName = document.getElementById("activeAppName");

  const windows = Array.from(document.querySelectorAll(".window"));

  // Each entry stores window metadata we mutate at runtime.
  const apps = new Map();
  windows.forEach((el) => {
    apps.set(el.dataset.app, {
      id: el.dataset.app,
      el,
      title: el.dataset.title || el.dataset.app,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      // Cache pre-maximize geometry so we can restore it.
      restore: null,
    });
  });

  let zCounter = 10;
  let activeAppId = null;

  /* ---------- Open / close / focus ---------- */
  function openApp(id) {
    const app = apps.get(id);
    if (!app) return;
    if (app.isMinimized) {
      // Restore from minimized state.
      app.isMinimized = false;
      app.el.classList.remove("minimized");
    }
    if (!app.isOpen) {
      app.isOpen = true;
      app.el.classList.add("open");
      placeInViewportIfNeeded(app.el);
    }
    focusApp(id);
    updateDockState();
  }

  function closeApp(id) {
    const app = apps.get(id);
    if (!app) return;
    app.isOpen = false;
    app.isMinimized = false;
    app.isMaximized = false;
    app.el.classList.remove("open", "minimized", "maximized", "active");
    // Restore original size if it was maximized.
    if (app.restore) {
      applyGeometry(app.el, app.restore);
      app.restore = null;
    }
    if (activeAppId === id) {
      activeAppId = null;
      activeAppName.textContent = "Finder";
      // Focus the next open window, if any.
      const next = [...apps.values()].find((a) => a.isOpen && !a.isMinimized);
      if (next) focusApp(next.id);
    }
    updateDockState();
  }

  function minimizeApp(id) {
    const app = apps.get(id);
    if (!app || !app.isOpen) return;
    app.isMinimized = true;
    app.el.classList.add("minimized");
    app.el.classList.remove("active");
    if (activeAppId === id) {
      activeAppId = null;
      activeAppName.textContent = "Finder";
      const next = [...apps.values()].find((a) => a.isOpen && !a.isMinimized);
      if (next) focusApp(next.id);
    }
    updateDockState();
  }

  function toggleMaximizeApp(id) {
    const app = apps.get(id);
    if (!app) return;
    if (app.isMaximized) {
      app.isMaximized = false;
      app.el.classList.remove("maximized");
      if (app.restore) {
        applyGeometry(app.el, app.restore);
        app.restore = null;
      }
    } else {
      // Save current geometry to restore later.
      app.restore = readGeometry(app.el);
      app.isMaximized = true;
      app.el.classList.add("maximized");
    }
    focusApp(id);
  }

  function focusApp(id) {
    const app = apps.get(id);
    if (!app) return;
    apps.forEach((a) => a.el.classList.remove("active"));
    app.el.classList.add("active");
    app.el.style.zIndex = String(++zCounter);
    activeAppId = id;
    activeAppName.textContent = appDisplayName(app.title);
  }

  function appDisplayName(title) {
    // Use the part before " — " as the app name, e.g. "About — Your Name" -> "About".
    return title.split("—")[0].trim() || title;
  }

  /* ---------- Geometry helpers ---------- */
  function readGeometry(el) {
    return {
      left: el.style.left,
      top: el.style.top,
      width: el.style.width,
      height: el.style.height,
    };
  }
  function applyGeometry(el, g) {
    if (g.left) el.style.left = g.left;
    if (g.top) el.style.top = g.top;
    if (g.width) el.style.width = g.width;
    if (g.height) el.style.height = g.height;
  }

  function placeInViewportIfNeeded(el) {
    // Ensure the window is not opened off-screen on small viewports.
    const rect = el.getBoundingClientRect();
    const maxLeft = window.innerWidth - Math.min(rect.width, window.innerWidth - 16);
    const maxTop = window.innerHeight - Math.min(rect.height, window.innerHeight - 120);
    const curLeft = parseFloat(el.style.left) || rect.left;
    const curTop = parseFloat(el.style.top) || rect.top;
    if (curLeft > maxLeft) el.style.left = Math.max(8, maxLeft) + "px";
    if (curTop > maxTop) el.style.top = Math.max(36, maxTop) + "px";
  }

  /* ---------- Traffic-light buttons ---------- */
  windows.forEach((el) => {
    const id = el.dataset.app;
    el.querySelector(".tl-close").addEventListener("click", (e) => {
      e.stopPropagation();
      closeApp(id);
    });
    el.querySelector(".tl-min").addEventListener("click", (e) => {
      e.stopPropagation();
      minimizeApp(id);
    });
    el.querySelector(".tl-max").addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMaximizeApp(id);
    });

    // Clicking anywhere on the window focuses it.
    el.addEventListener("mousedown", () => focusApp(id), true);
    el.addEventListener("touchstart", () => focusApp(id), { passive: true, capture: true });

    // Double-click title bar toggles maximize (a familiar macOS gesture).
    const titlebar = el.querySelector(".window-titlebar");
    titlebar.addEventListener("dblclick", (e) => {
      // Ignore double-clicks on the traffic lights themselves.
      if (e.target.closest(".traffic-lights")) return;
      toggleMaximizeApp(id);
    });

    // Draggable.
    makeDraggable(el, titlebar, id);
  });

  /* ---------- Dragging ---------- */
  function makeDraggable(windowEl, handle, id) {
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;
    let dragging = false;

    const onDown = (e) => {
      // Don't drag if maximized, or if user clicked a traffic light.
      if (windowEl.classList.contains("maximized")) return;
      if (e.target.closest(".traffic-lights")) return;
      const point = pointer(e);
      dragging = true;
      startX = point.x;
      startY = point.y;
      const rect = windowEl.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      // Lock to absolute pixels so dragging is smooth even if % was set.
      windowEl.style.left = startLeft + "px";
      windowEl.style.top = startTop + "px";
      focusApp(id);
      e.preventDefault();
    };
    const onMove = (e) => {
      if (!dragging) return;
      const point = pointer(e);
      const dx = point.x - startX;
      const dy = point.y - startY;
      // Clamp so the title bar can't be dragged completely off-screen.
      const minTop = 30; // below the menu bar
      const maxLeft = window.innerWidth - 40;
      const minLeft = -windowEl.offsetWidth + 80;
      const maxTop = window.innerHeight - 60;
      const nextLeft = Math.min(maxLeft, Math.max(minLeft, startLeft + dx));
      const nextTop = Math.min(maxTop, Math.max(minTop, startTop + dy));
      windowEl.style.left = nextLeft + "px";
      windowEl.style.top = nextTop + "px";
    };
    const onUp = () => {
      dragging = false;
    };

    handle.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    handle.addEventListener("touchstart", onDown, { passive: false });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
  }
  function pointer(e) {
    if (e.touches && e.touches[0]) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  /* ---------- Dock interactions ---------- */
  const dockItems = Array.from(dockList.querySelectorAll(".dock-item"));
  dockItems.forEach((item) => {
    const id = item.dataset.target;
    item.addEventListener("click", () => {
      const app = apps.get(id);
      if (!app) return;
      if (!app.isOpen) {
        openApp(id);
      } else if (app.isMinimized) {
        // Restore minimized window.
        app.isMinimized = false;
        app.el.classList.remove("minimized");
        focusApp(id);
        updateDockState();
      } else if (activeAppId === id) {
        // Clicking the active app's dock icon minimizes it.
        minimizeApp(id);
      } else {
        focusApp(id);
      }
    });
  });

  function updateDockState() {
    dockItems.forEach((item) => {
      const app = apps.get(item.dataset.target);
      const open = !!app && app.isOpen && !app.isMinimized;
      item.dataset.open = open ? "true" : "false";
    });
  }

  /* ---------- Default state ---------- */
  // Open the About window on load so the desktop isn't empty.
  openApp("about");

  /* ---------- Keyboard niceties ---------- */
  window.addEventListener("keydown", (e) => {
    // Cmd/Ctrl + W closes the active window.
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "w") {
      if (activeAppId) {
        e.preventDefault();
        closeApp(activeAppId);
      }
    }
    // Cmd/Ctrl + M minimizes the active window.
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "m") {
      if (activeAppId) {
        e.preventDefault();
        minimizeApp(activeAppId);
      }
    }
  });

  /* ---------- Resize handler ---------- */
  window.addEventListener("resize", () => {
    // Keep windows inside the viewport after resize.
    apps.forEach((app) => {
      if (app.isOpen && !app.isMaximized) placeInViewportIfNeeded(app.el);
    });
  });
})();
