# The Vernon Copy Center — demo preview

Static HTML + CSS + vanilla JS. No build step and no dependencies. Open `index.html` in a browser, or serve the folder with any static server (`python3 -m http.server`). Deployed at https://vernoncopycenter.com (pushes to main auto-deploy on Vercel).

```
index.html          page markup, inline SVG icons, LocalBusiness structured data (verified facts only)
styles.css          design tokens, layout, components, motion, reduced-motion rules
script.js           headline splits, scroll reveals, header/menu, cursor glow, magnetic buttons, tilt, form, hours
bg.js               WebGL "ink in water" shader (page background + stage and CTA panel variants)
assets/logo-mark.svg  proposed emblem concept (not an official logo)
assets/logo.svg       proposed full lockup: emblem, wordmark and tagline
assets/favicon.svg
```

## Design direction

Styled after the shop's business card: a clean white sheet, royal blue bands (demo bar, showcase stage, CTA panel, footer with a card-style pink swoosh), hot pink accents and blue-to-pink gradients. Two live pink swoosh lines are drawn across the page and breathe slowly.

- Type: Poppins (bold geometric, like the card) for display and body; Yellowtail for the script "Copy Center" wordmark; IBM Plex Mono for small labels.
- Tokens: `--blue #0b47b0`, `--blue-deep #08368a`, `--pink #f0168c`, `--text #0b1a3d`, `--text-muted #46536f`, `--accent-bright #d10b78` (pink dark enough for text on white). `.on-blue` flips the tokens to white text inside the blue bands.
- Wordmark: recreated from the business card in a web font, not the original artwork. Swap in the real logo file for launch.

## Motion features

Two pink swoosh lines (SVG beziers) draw in on load, breathe slowly, drift with scroll and soften behind reading content. The showcase and CTA panels run a royal blue WebGL ink shader (half resolution, DPR capped at 1.5, paused off screen). emblem draws itself; headline words rise from a blur (55 ms stagger, `aria-label` keeps the full text); hero drifts and fades on scroll. Scroll reveals (fade, rise, unblur, 70 ms sibling stagger, once). Accent dividers wipe in. Service marquee (outline and shimmer, pauses on hover). Mockup tilt toward the cursor plus idle float. Cursor glow and magnetic buttons on fine pointers. 2 px scroll progress bar. SVG feTurbulence grain overlay. Conic light travelling around glass borders on hover. `prefers-reduced-motion` turns all of it off and renders the shader as a single still frame.

## Verified from copycentervernon.com (checked 2026-10-15)

- Address, phone, email; fax 973-764-5656. ZIP is 07462, per the shop's business card (the original brief said 07422)
- Hours: Mon 9–5, Tue 10–6, Wed–Fri 9–5. No weekend hours listed (shown as "Not listed")
- Notary: $5 per signature, no appointment necessary; don't sign before you're in front of the notary; bring witnesses over 18
- Document shredding
- Directions: from Church Street turn left onto Vernon Crossing Road; on the left across from the BUMP sign, before the railroad tracks

The existing site showed no logo, photos, reviews or extra towns, so none are used.

## Placeholders and things to confirm before launch

- **Reviews**: all three are labeled samples. Replace with real reviews (with permission) or remove the section.
- **Service illustrations**: six generated line drawings (paper stack with CMYK dots, original and copy, bezier artboard, notarized page with seal, shredder strips, document folder). Decorative, not photos of the shop.
- **Showcase mockups**: CSS-built illustrations ("Spring Craft Fair" flyer, "Your Business" card, envelope), labeled as not actual client work.
- **Logo**: the registration-target emblem and wordmark are a proposed concept. Swap in the real logo if one exists.
- **Service descriptions** are written generically around the four confirmed categories plus notary and shredding. Confirm wording and any specifics (paper stocks, sizes, turnaround) with the owner. No prices other than the notary fee, no turnaround times, no years in business.
- **Notary fee and hours** come from the current site; confirm they're still current.
- **"Open now / Closed now" badge** is computed from the hours above in New York time and doesn't know about holidays.
- **Process step 3** ("pick it up in Vernon") assumes in-store pickup; confirm.
- The demo bar has been removed; SAMPLE tags still mark placeholder sections.

## The quote form

Not connected to anything. On submit it validates (on blur and on submit, with an error summary that focuses the first invalid field), shows a loading state, then shows a success panel that says plainly nothing was sent, with a ready-made message to copy, an "Open in email" `mailto:` link, and the phone number. There is no file upload.

To make it live, point the form at a real handler (for example Formspree, Basin, Netlify Forms, or a small serverless function that emails copycenter@warwick.net), replace the `setTimeout` block in `script.js` with a `fetch` POST, and handle the error state. Add spam protection (honeypot or Turnstile).

## What works

Phone links use `tel:`, email links use `mailto:`, copy buttons copy the phone and email, directions open Google Maps in a new tab, service rows jump to the form with that service preselected, mobile menu (hamburger to X, Escape closes, focus moves into the menu), sticky frosted header, current-section nav highlight, skip link, visible focus rings.

## Tested

Headless Chromium (SwiftShader WebGL) at 1440, 768 and 375 px: no console errors, no horizontal page overflow, WebGL background renders, reveals all complete after scrolling, mobile menu opens and closes, form error and success states work. Not tested on real phones, Safari or Firefox, and frame rate was not measured.

## Limitations

No map embed (a directions link instead). Google Fonts loads from the network; without it the page falls back to Helvetica/Arial. Backdrop blur is heavy on very old devices.
