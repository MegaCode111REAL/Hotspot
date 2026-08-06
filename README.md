# Hotspot

A lightweight template for turning any image into an interactive, clickable diagram. Drop pins at fixed pixel positions on a background image; each pin expands into a popup with a heading and body text. Built with plain HTML, CSS, and JS — no build step, no dependencies.

## Files

| File | What it does |
|---|---|
| `hotspot-template.html` | The page itself — links the CSS and JS, and holds your list of hotspots |
| `hotspot.css` | All styling: layout, colors, animations, light/dark mode |
| `hotspot.js` | The `makePopup()` function and click logic |

Keep all three files in the same folder — the HTML file references the other two by relative path (`hotspot.css`, `hotspot.js`).

## Quick start

1. Put your diagram image in the same folder.
2. Open `hotspot.css` and set the image in `.diagram`:
   ```css
   background-image: url('YOUR-IMAGE.jpg');
   ```
3. Open `hotspot-template.html` and add one line per point of interest:
   ```js
   makePopup(x, y, "Heading", "Body text");
   ```
   - `x`, `y` — pixel position of the dot, measured from the top-left of the image
   - `"Heading"` — short popup title
   - `"Body text"` — the explanation shown when clicked
4. Open the HTML file in a browser.

## Finding x/y coordinates

Open the page in a browser, right-click → **Inspect**, and hover over the image to read pixel coordinates from the dev tools ruler/overlay, or temporarily add a test hotspot and nudge the numbers until it lands where you want.

## Behavior

- The background image is locked to fit the screen (`background-size: contain`) with no scrolling or cropping.
- Clicking a dot opens its popup; clicking another dot or the close button (`×`) closes it.
- Clicking anywhere outside a hotspot or popup closes whatever is open.
- Only one popup is open at a time.

## Styling notes

- Dots pulse teal by default (edge → center) and switch to orange with an outward pulse when selected.
- Dots and popups are semi-transparent so the image underneath stays visible; heading and body text stay fully opaque.
- Colors automatically adapt to the viewer's light/dark mode via `prefers-color-scheme` — no toggle needed.
- All colors live in CSS variables at the top of `hotspot.css` (`:root` and the `prefers-color-scheme: light` block) if you want to retheme.

## Making a new diagram

Copy all three files into a new folder, point `hotspot.css` at a new image, and replace the `makePopup(...)` calls in the HTML with your new set of points.
