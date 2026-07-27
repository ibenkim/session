# Resume.app — a macOS-style personal resume

A single-page, vanilla HTML / CSS / JS resume site styled as a small macOS
desktop, with a menu bar, draggable windows, traffic-light controls, a Dock,
and a light/dark theme toggle.

No frameworks. No build step. Three files.

## Files

| File         | Purpose                                                    |
| ------------ | ---------------------------------------------------------- |
| `index.html` | Page structure and the content of every "app" window.      |
| `styles.css` | Design tokens, layout, dark/light themes, responsiveness.  |
| `script.js`  | Window manager: drag, focus, minimize/maximize, dock.      |

## Editing your content

Open `index.html` and search for `[EDIT]` — those are the spots that still need
personal links (GitHub profile, project repos, resume PDF). The windows:

- **About** — name, headline, intro paragraph, contact buttons.
- **Skills** — the stack JSON block and the four category cards.
- **Experience** — `<li class="timeline-entry">` blocks, newest first.
- **Projects** — `<a class="project-card">` cards.
- **Education** — `<article class="pub-item">` entries for degrees and awards.
- **Teaching** — items in the `<ul class="lecture-list">`.
- **Growth Story** — milestones in `<ol class="growth-list">`.
- **Contact** — the `<ul class="contact-list">` links and the resume PDF.

### Adding your resume PDF

Drop the file in this folder as `resume.pdf`. The Contact window already links
to `./resume.pdf`.

### Hiding a window

Delete its `<section class="window">` block and the matching
`<li class="dock-item">` in the Dock. The `data-app` and `data-target` values
are what pair a window to its dock icon, so keep those in sync.

### Changing colours and icons

- Theme colours are CSS variables at the top of `styles.css` — see
  `:root[data-theme="dark"]` and `:root[data-theme="light"]`.
- Dock icon gradients are inline on each `.dock-icon` via `--g1` / `--g2`.

## Running locally

Opening `index.html` directly works. To serve it the way it'll run in
production:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Deploying to GitHub Pages

1. Push this repository to GitHub.
2. In repository settings, open **Pages**.
3. Set the source to your default branch and `/ (root)`.
4. Save — the site goes live at `https://<user>.github.io/<repo>/`.

## Interactions cheat sheet

- Click a Dock icon to open or focus an app.
- Click the active app's Dock icon again to minimize it.
- Drag a window by its title bar.
- Double-click a title bar to toggle maximize.
- Traffic lights handle close / minimize / maximize.
- The moon / sun in the menu bar toggles the theme, saved to `localStorage`.
- `⌘ / Ctrl + W` closes the focused window; `⌘ / Ctrl + M` minimizes it.

## Accessibility & responsiveness

- Reduced-motion users get near-instant transitions.
- On mobile, windows expand to fill the desktop and the dock scrolls
  horizontally along the bottom.
