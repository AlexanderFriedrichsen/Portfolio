# Sounds

Phase A polish (round 3): the three canonical WAVs at the root of this folder
are the real Microsoft Windows XP ceremony sounds, sourced from the Internet
Archive's `windowsxpstartup_201910` collection. Homage use, same posture as
mitchivin.com.

- `login.wav` — real XP Logon Sound. Plays when the user clicks the login avatar.
- `logoff.wav` — real XP Logoff Sound. Reserved for Phase C Turn Off dialog.
- `balloon.wav` — real XP Balloon notification. Plays with the welcome balloon ~2 s after login.

## Full XP sound library

The full archive.org collection (`windowsxpstartup_201910/`, ~39 WAVs, ~2.9 MB)
used to live here but was relocated out of `public/` because Astro was
shipping the entire library on every page load. It now lives at
`assets-archive/sounds/windowsxpstartup_201910/` (outside `public/`, not
deployed). See `assets-archive/sounds/README.md` for details.

When a future phase needs a new sound (e.g. Phase C shutdown ceremony wants
`Windows XP Shutdown.wav`), copy the chosen WAV into this folder with a
short lowercase filename (`shutdown.wav`) and reference it from
`audioManager.ts`. **Do NOT move the full subfolder back into `public/`** —
it was deliberately evicted and must stay in `assets-archive/`.

## Alternate-format duplicates

`Windows XP - Logoff sound [01].opus` and `Windows XP - Notify [01].opus` are
alternate-format duplicates from a different source. Not referenced at runtime.
