# CLAUDE.md — The Vernon Copy Center website

Handoff notes for whoever picks up this site. Everything here comes from the project conversation
(Oct 15 – Oct 21, 2026) or from the repo itself. Anything not confirmed is marked **unconfirmed**.
No passwords, keys or personal contact details are recorded here on purpose.

---

## 1. Client overview

| | |
|---|---|
| Business | The Vernon Copy Center (Google lists it as "The Vernon Copy Center, LLC") |
| Contact person | Katie Kaslaitis (name on her business card; customers' reviews name "Katie and her staff"). Her exact title or ownership is **unconfirmed** |
| What they do | Local printing, copying, graphic design and business services, plus notary and document shredding |
| Location | 70 Vernon Crossing Road, Vernon, NJ 07462 |
| Service area | Vernon, NJ and surrounding communities. No specific extra towns are confirmed, so none are listed |
| Web designer | florent (FD Web Designs, GitHub `florentwebdesigns`) |
| Previous website | https://copycentervernon.com/ (the source of the verified facts below) |

## 2. Public business info

- **Phone:** 973-764-5655 (main CTA "Call", `tel:+19737645655`)
- **Fax:** 973-764-5656
- **Email:** copycenter@warwick.net
- **Address:** 70 Vernon Crossing Road, Vernon, NJ 07462
  - The original brief said **07422**. The business card says **07462**, so the site uses 07462 everywhere, including the JSON-LD.
- **Directions (from the old site):** from Church Street, turn left onto Vernon Crossing Road. The shop is on the left, across from the BUMP sign and before the railroad tracks.
- **Hours (from the old site, checked 2026-10-15; still current? unconfirmed):**
  Mon 9–5, Tue 10–6, Wed 9–5, Thu 9–5, Fri 9–5. Sat/Sun not listed (shown as "Not listed").
- **Services shown on the site:** Printing, Copying, Graphic design, Business services, Notary, Document shredding.
  - Customer reviews also mention shipping (FedEx drop-off and package shipping), faxing, scanning, invitations and custom shirts. These are **unconfirmed** as official services and are not listed as services.
- **Prices shown:** only the notary fee, **$5 per signature**, no appointment needed (from the old site). Also from the old site: don't sign before you're in front of the notary, and bring witnesses over 18. No other prices, turnaround times or years in business are shown.
- **Booking links:** none. There is no Vagaro or other booking platform. "Booking" here means the quote request form.
- **Social links:** none provided.
- **Google reviews:** 12 real reviews were supplied by florent and are on the site. The Google Business profile URL was not provided (**unconfirmed**).

## 3. Website goals and audience

From the master prompt:
- **Goals:** more phone calls and quote requests. Present the confirmed services clearly and make it easy for locals to get in touch about a project.
- **Primary CTA:** Request a Quote. **Secondary CTA:** Call 973-764-5655.
- **Audience:** local residents, individuals, small businesses and organizations that need printing, copying, design or business services.
- **Brand personality:** creative, dependable, welcoming, professional, detail-oriented, approachable, community-focused.
- **Florent's added goal:** analytics showing who calls, emails or books (see §6).

## 4. Pages, sections and features

It's a single page, `index.html`. Sections in order:

1. **Header:** sticky and frosted. Script wordmark logo, nav (Home, Services, Work, About, Visit, Contact), phone button and "Request a Quote" button. Hamburger menu on mobile.
2. **Hero:** "Print it right, right here in Vernon." Small registration-mark emblem, service eyebrow, lede, two CTAs, address corner, scroll cue.
3. **Intro:** statement and service pills.
4. **Marquee:** scrolling service words, paused on hover.
5. **Services:** six numbered rows, each with a generated line-drawing illustration. Clicking a row jumps to the form with that service preselected. Notary shows a "$5" stamp.
6. **Recent work (`#work`):** four real photos from the shop: award plaque, wedding welcome sign, fabric party backdrop, association pin badges.
7. **About:** copy, a facts list (where, phone, fax, notary), and a CSS mockup "stage" (flyer, business card, envelope) labeled **SAMPLE: illustrative mockups, not actual client work**.
8. **Why:** four reasons in a crop-marked sheet.
9. **Process:** three steps. Step 3, "pick it up in Vernon", assumes in-store pickup (**unconfirmed**).
10. **Reviews (`#reviews`):** 12 real Google reviews in a masonry grid, each tagged "Google review".
11. **CTA panel:** royal blue with the WebGL shader. "Got a project on your desk?"
12. **Contact (`#contact`):** contact lines with copy buttons, and the quote form (see below).
13. **Visit (`#visit`):** address, directions, Google Maps directions link (no embedded map), and an hours table with an "Open now / Closed now" badge computed in America/New_York time. The badge doesn't know about holidays.
14. **Footer:** blue band with a pink swoosh. Brand, nav, services, contact, and a giant script wordmark.

**Quote form:**
- **Fields:** name, email, optional phone, service, project details, optional "needed by" date. There is also a hidden honeypot field, `website`.
- **Validation:** runs on blur and on submit, with an error summary.
- **On submit:**
  1. The site POSTs the booking to the Google Apps Script web app (Bookings tab).
  2. It shows "Thanks, your request is in" with a copy of the message and Copy, Open in email and Text it to us buttons.
  3. On phones and tablets it also opens the customer's Messages app, pre-filled to Katie's cell (`SMS_TO` in `script.js`). The customer still has to press send.
- **No file uploads, payments or online ordering.**

**Tracking:** every tap on a `tel:` link logs to the **Calls** tab. Every tap on a `mailto:` link logs to the **Email** tab, except the post-submit "Open in email" button.

## 5. Design direction

Current look, since 2026-10-21: **styled after Katie's business card.**

- **Background:** a white page with **two live pink swoosh lines** (SVG beziers in `bg.js`).
  - The lines draw in on load, breathe slowly and drift with scroll.
  - They fade to about 45% behind reading content.
  - One is thick and sweeps toward the top right; one is thin and runs across the bottom.
- **Royal blue bands:** showcase stage, CTA panel, footer (footer opens with a white/pink card-style swoosh). Stage and CTA run a royal blue WebGL "ink" shader.
- **Colors (CSS tokens in `styles.css`):** `--blue #0b47b0`, `--blue-deep #08368a`, `--pink #f0168c`, `--accent-bright #d10b78` (pink for text on white), `--text #0b1a3d`, `--text-muted #46536f`.
  - Gradients run blue to violet to pink (`--grad-accent`, `--grad-btn`).
  - `.on-blue` flips the tokens to white text inside blue bands.
- **Fonts (Google Fonts):** **Poppins** (bold geometric, like the card) for headings and body. **Yellowtail** for the script "Copy Center" wordmark. **IBM Plex Mono** for small uppercase labels.
- **Mood:** clean, bright and professional, with print-shop details: registration marks, crop marks, CMYK dots.
- **Logo:**
  - The wordmark is recreated in web fonts from the business card: a small italic pink "VERNON" over a blue script "Copy Center". It is **not the original artwork**; ask for the real logo file.
  - `assets/logo.svg`, `assets/logo-mark.svg` and `assets/favicon.svg` are the earlier proposed registration-target emblem, recolored pink and blue. That emblem was never confirmed as an official logo.
- **References:** Katie's business card (royal blue, hot pink, white, script wordmark), the master prompt, and the old site copycentervernon.com.

## 6. Tech details

- **Stack:** static HTML + CSS + vanilla JS. No build step and no dependencies.
- **Repo:** `github.com/florentwebdesigns/vernon-copy-center`, branch `main` (public).
- **Hosting:** Vercel project `fwebdesigns/vernon-copy-center`, framework "Other"/none. **Every push to `main` auto-deploys.** `vercel.json` sets `cleanUrls: true`.
  - The deploy result shows as the GitHub commit status (`gh api repos/florentwebdesigns/vernon-copy-center/commits/main/status`).
  - Claude's Vercel connector had no access to the `fwebdesigns` team, so domain and settings changes went through florent.
- **Live URLs:** https://vernoncopycenter.com, https://www.vernoncopycenter.com, https://vernon-copy-center.vercel.app
- **Domain and DNS:** the domain was bought at Namecheap. Records were switched (2026-10-21) to Vercel's recommended values:
  - A `@` → `216.198.79.1`
  - CNAME `www` → `93808d3710129736.vercel-dns-017.com.`
- **Google Sheets analytics (Apps Script):**
  - **Code:** `docs/booking-log.gs`. Florent pastes it into Extensions > Apps Script of a Google Sheet in their own Google account.
  - **Web app URL:** set in `QUOTE_LOG` at the top of `script.js`. Emptying `QUOTE_LOG` turns logging off and puts the form back into demo mode.
  - **Tabs:** created automatically on the first event:
    - **Calls:** Tapped Call, Device, Page
    - **Email:** Tapped Email, Device, Page
    - **Bookings:** Booked, Name, Email, Phone, Service, Needed By, Details, Device, Page
  - **Booking email:** each booking is emailed to `NOTIFY_EMAIL` (copycenter@warwick.net), and Reply goes to the customer.
  - **Automatic SMS:** the script has an optional automatic text (carrier email-to-text via `SMS_GATEWAY`, or Twilio via Script Properties). It is **off**, because Katie's carrier is unknown. Texting today works through the customer's own Messages app (§4).
  - **Deployment:** florent reported version 4 deployed on the current URL. A full end-to-end test has **not been confirmed**, meaning a row in each tab plus the booking email arriving.
  - **Script updates:** a script change only takes effect after florent pastes it, runs a function once to approve any new permissions, then uses **Deploy > Manage deployments > Edit > New version**. A *New deployment* creates a new URL, and then `QUOTE_LOG` must be updated.
- **No other integrations:** no Vagaro, no CMS, no analytics package.
- **Fonts:** load from Google Fonts. Without them the page falls back to Helvetica/Arial.

## 7. Decisions made and why

- **Static site, no build:** the master prompt default. Easy to host on Vercel as-is.
- **Demo-pitch honesty rules:** nothing invented. Placeholders are visibly labeled; README lists them.
- **ZIP 07462:** the business card overrides the brief's 07422.
- **Hours and notary fee:** taken from the old site, because the brief had no hours.
- **Business card theme replaced the dark themes:** florent asked for the card's colors, then a white background with two animated pink lines.
- **Dark-mode issue:** florent's browser once showed the white site as dark. That's probably a dark-mode browser extension (**unconfirmed**).
- **Script wordmark recreated in web fonts:** no logo file was supplied; the card was the only reference.
- **Analytics modeled on florent's "Stu Plumbing Booking Analytics" sheet:** florent wanted to see who calls, emails or books, not a booking dashboard.
- **Texting via the customer's Messages app:** free, and works with any carrier. Automatic SMS would need Katie's carrier, or Twilio, which is paid.
- **Reviews:** customer text only, no owner replies. Names shortened to first name + last initial; Claude chose this, and florent was offered full names (no answer yet). Reviews that were cut off on Google end with "…".
- **Demo bar removed:** at florent's request.

## 8. What the client asked for or rejected

Asked for, in order:
1. Build the demo from the master prompt in DEMO PITCH mode. "No questions", generate the logo and pictures.
2. Brown/amber/ivory smoky theme from a screenshot. Later replaced.
3. Remove the hero "target circle" (a halftone loupe) but keep the live smoky background. Deploy to GitHub/Vercel.
4. Bring back the live smoke after a dark overlay hid it. That overlay was rejected.
5. Connect vernoncopycenter.com. Update DNS to Vercel's recommended records.
6. Switch to the business card colors with professional gradients, keeping the live effects.
7. Make the background white with two animated pink lines and theme the whole site like the card.
8. Remove the "Demo preview. Anything tagged Sample…" bar.
9. Build a Google Sheet + Apps Script like the Stu Plumbing sheet: **Calls**, **Email** and **Bookings** tabs.
10. Send bookings to Katie by SMS on her cell.
11. Add the four work photos.
12. Add the 12 Google reviews, customer text only.

Rejected or reversed:
- **Dark radial shade over the smoke:** removed.
- **"Flame looking" background:** the request was made, then florent said **stop** before any change shipped. Not built.
- **Booking dashboard version of the sheet:** status dropdowns, KPI dashboard and charts. Rejected for the simpler Stu Plumbing-style analytics.
- **Brown theme, then dark blue/pink smoke theme:** both replaced by the white card theme.

## 9. Open tasks and next steps

- [ ] **Run an end-to-end analytics test:** tap the phone number, tap the email, send a quote on a phone. Check for a row in each tab, the email at copycenter@warwick.net, and Messages opening.
- [ ] **Get the real logo file** from the business card designer, then swap it into the header, footer and favicon.
- [ ] **Remove or replace leftover demo labels:**
  - the About "SAMPLE: Illustrative mockups" stage (could become real photos)
  - the form's "Demo" notice markup (hidden by JS while `QUOTE_LOG` is set)
  - the footer line "Demo preview. Script wordmark recreated…"
- [ ] **Confirm with the shop:** hours, notary fee, service wording, in-store pickup (Process step 3), and whether shipping, fax, scanning, invitations and shirts should be listed as services.
- [ ] **Get full text** of the five truncated reviews (Rhonda, Helen, Mischa, Erica, Andrew) if wanted.
- [ ] **Decide on the hero emblem:** keep the small registration-mark emblem above the hero, or replace it with the real logo. **Unconfirmed** preference.
- [ ] **Optional automatic SMS:** needs Katie's carrier (Verizon, T-Mobile or US Cellular are free via the gateway) or a Twilio account.
- [ ] **Update stale README sections:** "Motion features" and "Logo" still describe the old dark/emblem version. This file is current.
- [ ] **Not tested** on real phones, Safari or Firefox. Frame rate not measured.

## 10. Files, images, prompts and assets

**Repo (`vernon-copy-center/`):**

| Path | What |
|---|---|
| `index.html` | All markup, inline SVG icon sprite (`#emblem`, `#i-phone`, `#i-mail`…), LocalBusiness JSON-LD |
| `styles.css` | Tokens, layout, components, swooshes, reduced-motion rules |
| `script.js` | Headline splits, reveals, menu, cursor glow, magnetic buttons, tilt, form, `QUOTE_LOG` / `SMS_TO`, click tracking, hours badge |
| `bg.js` | Pink swoosh animation, plus the WebGL ink shader for the stage and CTA panels (`canvas[data-shader]`) |
| `assets/favicon.svg`, `assets/logo.svg`, `assets/logo-mark.svg` | Proposed emblem concept (not official) |
| `assets/work/award-plaque.jpg`, `wedding-sign.jpg`, `event-backdrop.jpg`, `pin-badges.jpg` | Real work photos supplied by florent |
| `docs/booking-log.gs` | Apps Script for the Calls / Email / Bookings sheet |
| `vercel.json` | `{"cleanUrls": true}` |
| `README.md` | Older project notes (partly stale, see §9) |
| `CLAUDE.md` | This file |

**Shared project folder:**
- `/mnt/project-files/vernon-copy-center/` holds a copy of the site files. The repo is the source of truth.

**Uploads** in `/mnt/project-files/uploads/hearth/`, named by ID:
- `9ebf34b9-…`: the **master prompt**, "Premium Cinematic Website: Master Prompt", with client inputs.
- `677a8a9b-…` and `85c84b90-…`: Katie's **business card**. Source of the colors, the ZIP and the wordmark style.
- `97e61a89-…`, `8c99e47f-…`, `e7b75f1b-…`, `9aaec828-…`: originals of the four work photos. Plaque, wedding sign, backdrop and badges, in upload order (mapping **unconfirmed**).
- `4c9114e3-…`: screenshot of the Stu Plumbing analytics sheet (the model for the tabs).
- `f67c4574-…`: screenshot used for the "flame" request (not built).
- `6a10e014-…`: Namecheap DNS records screenshot.
- `7aff6d9f-…`, `33f57fee-…`, `cf2fc30c-…`: Apps Script deploy dialog, empty sheet, and form success screenshots.
- Other screenshots, mostly theme references and Vercel/Namecheap DNS: `04435f9a-…`, `6dfb971f-…`, `0e8203a8-…`, `299737bc-…`, `ddf00c16-…`. Exact contents **unconfirmed**.

**Related repo:**
- `florentwebdesigns/beauty.by.diella`: its `docs/inquiry-log.gs` was the pattern for the Apps Script POST approach.

## 11. Rules for working on this site

**Always:**
- Keep the business card theme: white page, two live pink swooshes, royal blue bands, Poppins + Yellowtail. Keep the hero loupe/"target circle" removed.
- Use only verified facts. Never invent prices, hours, turnaround times, years in business, awards, reviews, staff names, towns or services. Unverified content must be labeled or left out.
- Use `tel:` and `mailto:` links. Every button must actually work. The form must either post to the configured endpoint or say clearly that it isn't connected.
- Keep reviews as the customers' words only: no owner replies and no edited meaning.
- Keep text readable over the swooshes. Body text keeps its white halo; check both themes of any band.
- Test at 1440, 768 and 375 px with no console errors and no horizontal scroll. Respect `prefers-reduced-motion`.
- Push to `main` to deploy, then confirm the GitHub commit status shows the Vercel deploy succeeded.
- When the Apps Script changes, tell florent to deploy a **new version** of the existing deployment. If the URL changes anyway, update `QUOTE_LOG`.

**Never:**
- Commit passwords, API keys or Twilio credentials. Twilio values belong in Apps Script **Script Properties** only.
- Present the CSS mockups or generated illustrations as the shop's real work.
- Present the recreated wordmark or the emblem as the official logo.
- Add a booking platform, payments, file uploads or "instant quote" claims unless they really exist.
- Add a dark overlay that hides the background animation (rejected before).
- Change the ZIP back to 07422.
