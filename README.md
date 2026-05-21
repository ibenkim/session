# Resume.app — a macOS-style personal resume

A single-page, vanilla HTML / CSS / JS resume site styled as a small macOS
desktop, with a menu bar, draggable windows, traffic-light controls, a Dock,
and a light/dark theme toggle.

No frameworks. No build step. Just three files.

## Files

| File          | Purpose                                                   |
| ------------- | --------------------------------------------------------- |
| `index.html`  | Page structure and the content of every "app" window.     |
| `styles.css`  | Design tokens, layout, dark/light themes, responsiveness. |
| `script.js`   | Window manager: drag, focus, minimize/maximize, dock.     |

## Editing your content

Open `index.html` and search for `[EDIT]` — every section that's meant to be
personalized has a marker. The windows you'll likely want to update:

- **About** — name, headline, intro paragraph, contact buttons.
- **Skills** — the stack JSON and the four category cards.
- **Experience** — `<li class="timeline-entry">` blocks.
- **Projects** — `<a class="project-card">` cards.
- **Publications** — `<article class="pub-item">` entries (or remove the
  window entirely if you have nothing to publish).
- **Lectures** — items in the `<ul class="lecture-list">`.
- **Growth Story** — milestones in `<ol class="growth-list">`.
- **Contact** — the `<ul class="contact-list">` links and the resume PDF.

### Hiding a window

If a section doesn't apply to you, delete its `<section class="window">` block
and the corresponding `<li class="dock-item">` in the Dock. The layout will
adjust on its own.

### Changing colours, dock icons, etc.

- Theme colours live in CSS variables at the top of `styles.css` — search for
  `:root[data-theme="dark"]` and `:root[data-theme="light"]`.
- Dock icon gradients are inline on each `.dock-icon` via `--g1` / `--g2`.
  Change those to recolour an icon.

## Running locally

You can just open `index.html` in a browser. For best results (e.g. so
`localStorage` and relative URLs behave like production), serve it with any
static file server:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Deploying to GitHub Pages

1. Push this repository to GitHub.
2. In the repository settings, go to **Pages**.
3. Set the source to your default branch and `/ (root)`.
4. Save — your site will be live at `https://<user>.github.io/<repo>/`.

That's it. No build, no CI required.

## Interactions cheat sheet

- Click a Dock icon to open / focus an app.
- Click the active app's Dock icon again to minimize it.
- Drag a window by its title bar.
- Double-click a title bar to toggle maximize.
- Use the traffic-light buttons for close / minimize / maximize.
- Click the moon / sun in the menu bar to toggle the theme (saved in
  `localStorage`).
- `⌘ / Ctrl + W` closes the focused window; `⌘ / Ctrl + M` minimizes it.

## Accessibility & responsiveness

- Reduced-motion users get instant transitions.
- On mobile, windows expand to fill the desktop for readability, and the dock
  remains scrollable along the bottom of the screen.

---

Designed to look at home next to the rest of your portfolio. Edit freely.
