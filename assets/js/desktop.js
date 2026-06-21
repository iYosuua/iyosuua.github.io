(function () {
  'use strict';

  const desktop = document.getElementById('desktop');
  const taskbar = document.getElementById('taskbar-buttons');
  const startBtn = document.getElementById('start-button');
  const startMenu = document.getElementById('start-menu');
  const clock = document.getElementById('clock');

  let zCounter = 100;
  const state = new Map(); // id -> { window, taskBtn, minimized, maximized, prevRect }

  /* ---------- Boot splash ---------- */
  const splash = document.getElementById('boot-splash');
  if (splash) {
    setTimeout(() => splash.classList.add('hidden'), 1200);
  }

  /* ---------- Clock ---------- */
  function updateClock() {
    const d = new Date();
    let h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    clock.textContent = `${h}:${m} ${ampm}`;
  }
  updateClock();
  setInterval(updateClock, 1000 * 30);

  /* ---------- Window registry ---------- */
  document.querySelectorAll('.os-window').forEach(win => {
    state.set(win.id, {
      window: win,
      taskBtn: null,
      minimized: false,
      maximized: false,
      prevRect: null,
    });

    // Wire title-bar buttons
    win.querySelectorAll('.title-bar-controls button').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const action = btn.dataset.action;
        if (action === 'close') closeWindow(win.id);
        else if (action === 'minimize') minimizeWindow(win.id);
        else if (action === 'maximize') toggleMaximize(win.id);
      });
    });

    // Drag by title bar
    const titleBar = win.querySelector('.title-bar');
    if (titleBar) makeDraggable(win, titleBar);

    // Focus on click anywhere
    win.addEventListener('mousedown', () => focusWindow(win.id));
  });

  function focusWindow(id) {
    const s = state.get(id);
    if (!s) return;
    zCounter += 1;
    s.window.style.zIndex = zCounter;
    syncTaskbar();
  }

  function openWindow(id) {
    const s = state.get(id);
    if (!s) return;
    if (!s.window.classList.contains('open')) {
      s.window.classList.add('open');
      addTaskBtn(id);
    }
    s.minimized = false;
    s.window.style.display = 'block';
    focusWindow(id);
  }

  function closeWindow(id) {
    const s = state.get(id);
    if (!s) return;
    s.window.classList.remove('open');
    s.window.classList.remove('maximized');
    s.maximized = false;
    s.minimized = false;
    if (s.taskBtn) {
      s.taskBtn.remove();
      s.taskBtn = null;
    }
  }

  function minimizeWindow(id) {
    const s = state.get(id);
    if (!s) return;
    s.minimized = true;
    s.window.style.display = 'none';
    syncTaskbar();
  }

  function toggleMaximize(id) {
    const s = state.get(id);
    if (!s) return;
    if (s.maximized) {
      s.window.classList.remove('maximized');
      if (s.prevRect) {
        s.window.style.left = s.prevRect.left + 'px';
        s.window.style.top = s.prevRect.top + 'px';
        s.window.style.width = s.prevRect.width + 'px';
      }
      s.maximized = false;
    } else {
      const r = s.window.getBoundingClientRect();
      s.prevRect = { left: r.left, top: r.top, width: r.width };
      s.window.classList.add('maximized');
      s.maximized = true;
    }
    focusWindow(id);
  }

  /* ---------- Taskbar buttons ---------- */
  function addTaskBtn(id) {
    const s = state.get(id);
    if (!s || s.taskBtn) return;
    const btn = document.createElement('button');
    btn.className = 'taskbar-btn';
    btn.textContent = s.window.dataset.title || id;
    const icon = s.window.dataset.icon;
    if (icon) {
      btn.style.backgroundImage = `url('assets/icons/${icon}.svg')`;
    }
    btn.addEventListener('click', () => {
      if (s.minimized || s.window.style.display === 'none') {
        s.minimized = false;
        s.window.style.display = 'block';
        focusWindow(id);
      } else {
        // Already visible: if focused, minimize; else focus
        const topZ = Math.max(...[...state.values()]
          .filter(x => x.window.classList.contains('open') && !x.minimized)
          .map(x => parseInt(x.window.style.zIndex || '0', 10)));
        if (parseInt(s.window.style.zIndex || '0', 10) >= topZ) {
          minimizeWindow(id);
        } else {
          focusWindow(id);
        }
      }
    });
    taskbar.appendChild(btn);
    s.taskBtn = btn;
  }

  function syncTaskbar() {
    const open = [...state.values()].filter(x => x.window.classList.contains('open'));
    const topZ = open.length
      ? Math.max(...open
          .filter(x => !x.minimized)
          .map(x => parseInt(x.window.style.zIndex || '0', 10)))
      : 0;
    open.forEach(s => {
      if (!s.taskBtn) return;
      const isTop = !s.minimized && parseInt(s.window.style.zIndex || '0', 10) === topZ;
      s.taskBtn.classList.toggle('active', isTop);
    });
  }

  /* ---------- Desktop icons ---------- */
  let selectedIcon = null;
  document.querySelectorAll('.desktop-icon').forEach(icon => {
    icon.addEventListener('click', e => {
      e.stopPropagation();
      if (selectedIcon && selectedIcon !== icon) selectedIcon.classList.remove('selected');
      icon.classList.add('selected');
      selectedIcon = icon;
    });
    icon.addEventListener('dblclick', e => {
      e.stopPropagation();
      const target = icon.dataset.target;
      if (target) openWindow(target);
    });
    // Mobile / touch: single tap also opens
    let lastTap = 0;
    icon.addEventListener('touchend', e => {
      const now = Date.now();
      if (now - lastTap < 400) {
        const target = icon.dataset.target;
        if (target) openWindow(target);
      }
      lastTap = now;
    });
  });

  // Click on bare desktop deselects
  desktop.addEventListener('click', () => {
    if (selectedIcon) {
      selectedIcon.classList.remove('selected');
      selectedIcon = null;
    }
    closeStartMenu();
  });

  /* ---------- Start menu ---------- */
  function openStartMenu() { startMenu.classList.add('open'); }
  function closeStartMenu() { startMenu.classList.remove('open'); }
  startBtn.addEventListener('click', e => {
    e.stopPropagation();
    startMenu.classList.toggle('open');
  });
  startMenu.addEventListener('click', e => {
    e.stopPropagation();
    const li = e.target.closest('li');
    if (!li) return;
    if (li.dataset.action === 'shutdown') {
      shutdown();
    } else if (li.dataset.target) {
      openWindow(li.dataset.target);
    }
    closeStartMenu();
  });

  function shutdown() {
    if (splash) {
      splash.classList.remove('hidden');
      splash.querySelector('.boot-inner').innerHTML =
        '<p style="font-size:18px">It is now safe to turn off your computer.</p>' +
        '<p style="font-size:11px; opacity:.6; margin-top:30px;">(Click anywhere to come back.)</p>';
      splash.addEventListener('click', () => splash.classList.add('hidden'), { once: true });
    }
  }

  /* ---------- Drag ---------- */
  function makeDraggable(win, handle) {
    let dragging = false;
    let startX = 0, startY = 0, origX = 0, origY = 0;

    handle.addEventListener('mousedown', e => {
      if (e.target.closest('.title-bar-controls')) return;
      if (win.classList.contains('maximized')) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const r = win.getBoundingClientRect();
      origX = r.left;
      origY = r.top;
      e.preventDefault();
    });

    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      let nx = origX + (e.clientX - startX);
      let ny = origY + (e.clientY - startY);
      const margin = 4;
      const maxX = window.innerWidth - 80;
      const maxY = window.innerHeight - 60;
      nx = Math.max(-win.offsetWidth + 80, Math.min(maxX, nx));
      ny = Math.max(margin, Math.min(maxY, ny));
      win.style.left = nx + 'px';
      win.style.top = ny + 'px';
    });

    document.addEventListener('mouseup', () => { dragging = false; });
  }

  /* ---------- Auto-open About on first load ---------- */
  window.addEventListener('load', () => {
    setTimeout(() => openWindow('window-about'), 1400);
  });

  // Expose for debugging
  window.WM = { open: openWindow, close: closeWindow, focus: focusWindow };
})();
