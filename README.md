# iyosuua.github.io — Win98 Resume Desktop

A Jekyll-powered resume site styled as a Windows 98 desktop, built with [98.css](https://jdan.github.io/98.css/) and a small vanilla-JS window manager. Inspired by [brynnpark.xyz](https://brynnpark.xyz).

## Features

- 🖥️ Teal Win98 desktop with clickable pixel icons
- 🪟 Draggable, minimisable, maximisable, closable windows
- 🧭 Bottom taskbar with Start menu, taskbar buttons and live clock
- 📂 Resume content driven by `_data/resume.yml`
- 📱 Responsive fallback — windows stack vertically on phones
- 🚀 Hostable on GitHub Pages out of the box

## Section windows

| Icon          | Window                          |
| ------------- | ------------------------------- |
| About Me      | Bio + profile photo             |
| Experience    | Career timeline (5 positions)   |
| Skills        | Skills grouped by area          |
| Projects      | Notable projects                |
| Contact       | Email · LinkedIn · GitHub       |
| My Computer   | Decorative — fake drives        |
| Recycle Bin   | Decorative — easter egg         |

## Local development

### Option A — Node preview (recommended on Windows)

A small Node renderer is included for quick local previews without installing Ruby/DevKit:

```bash
npm install
node _tools/render.js
npx http-server _site -p 4321 -c-1
# open http://localhost:4321
```

`_tools/render.js` uses [liquidjs](https://liquidjs.com/) in Jekyll-compatible mode
to render `index.html` with the `_layouts/default.html` layout, `_includes/*`,
and `_data/resume.yml`. It produces `_site/` exactly like Jekyll would.

### Option B — Real Jekyll

```bash
bundle install
bundle exec jekyll serve
# open http://localhost:4000
```

> If `bundle install` fails on Windows because of native-extension compilation
> (json / bigdecimal), install [RubyInstaller with DevKit](https://rubyinstaller.org/)
> and run `ridk install` so MSYS2 + the toolchain are available, then re-run
> `bundle install`.

## Deploying

This site is designed for GitHub Pages. Push to the `main` branch of the
`iYosuua/iYosuua.github.io` repository and Pages will build it automatically.

```bash
git remote add origin https://github.com/iYosuua/iYosuua.github.io.git
git add .
git commit -m "Reskin as Win98 desktop"
git push -u origin main
```

GitHub Pages will run Jekyll server-side — no native extensions required there.

## Editing your resume

All resume content lives in `_data/resume.yml`. Edit it and the windows update on the next build. No HTML changes needed for content tweaks.

## Project structure

```
.
├── _config.yml
├── Gemfile
├── _data/resume.yml         ← all resume content
├── _layouts/default.html
├── _includes/
│   ├── desktop-icon.html
│   ├── window.html
│   ├── taskbar.html
│   ├── start-menu.html
│   └── boot-splash.html
├── assets/
│   ├── css/{98.css, desktop.css}
│   ├── js/desktop.js        ← window manager
│   ├── icons/*.svg
│   └── images/profile.jpg
├── _tools/render.js         ← Node preview renderer (dev only)
└── index.html
```

## Credits

- [98.css](https://github.com/jdan/98.css) by Jordan Scales — Win98 widget styling
- Window-desktop concept inspired by [brynnpark.xyz](https://brynnpark.xyz)
