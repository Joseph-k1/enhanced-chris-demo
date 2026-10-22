# Guided demo experience

Adds contextual guidance to Joseph’s existing 12-step booking demo, based on commit `2643b60`.

## Behavior

- Guest and Venue host labels identify who acts at each step.
- Floating tips explain the current action; compact beacons mark the target.
- Closing a tip dismisses only that step. Guidance returns when switching steps.
- The borderless Show guidance switch stays off across steps until enabled again. Start over restores guidance.
- Helpers scroll to off-screen targets and the booking, submission, and approval actions.
- Guidance hides while the simulated payment dialog is open.
- Motion for React animates the continuous beacon pulse, toggle, and tip entrance. Only explicit dismissal plays the closing animation; page navigation removes the old tip immediately. Reduced-motion preferences are respected.
- Joseph’s Next, Back, step selection, and Start over controls retain their existing behavior.

## Implementation

`app/src/guidance/` contains the separate React guidance layer. It reads visible elements in the same-origin app iframe and responds to navigation, scrolling, and resizing. It does not modify booking data or the embedded app’s styles.

Four additive lines in `index.html` load the guide stylesheet, mount point, and script. The original `app.html`, compiled application assets, application components, images, and booking logic remain unchanged.

`app/vite.guide.config.ts` builds only the guidance into `guidance-assets/`. The generated JavaScript and CSS are included so the repository’s static demo works without a build step on the hosting service. Public app images are not copied into this bundle. The package lockfile makes dependency installation reproducible.

## Run locally

From the repository root:

```sh
python3 -m http.server 3324 --bind 127.0.0.1
```

Open http://127.0.0.1:3324/#venue.

## Rebuild guidance

```sh
cd app
npm ci
npm run check:guide
npm run build:guide
```

Refresh the browser after rebuilding. This does not rebuild the original application.

## Validation

Checked in the Codex browser at 1024 × 768 on October 22, 2026:

- All 12 steps show the expected guidance and role labels.
- Next, Back, step selection, Start over, and the Book Full Venue action navigate correctly.
- Per-step dismissal, global guidance switching across navigation, and keyboard switching work.
- Scroll helpers locate their targets; Month, Week, and Day calendar controls remain usable.
- Guidance hides for the simulated payment dialog and returns after cancellation.
- Rendered styles confirm continuous beacon pulsing, toggle movement/color interpolation, and explicit-close animation.
- TypeScript checking and the production guidance build pass.

Reduced-motion support is implemented; this check did not change the operating system preference. Screenshots and local QA output are kept outside this repository.
