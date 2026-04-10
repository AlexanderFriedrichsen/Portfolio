# Sounds Reference Library

Source assets vendored for the Portfolio XP desktop. Kept outside `public/`
so Astro doesn't ship them to `dist/`.

## `windowsxpstartup_201910/`

Full Microsoft Windows XP sounds library (39 WAVs, ~2.9 MB). Vendored in PR
#5 as a reference library for future phases that may wire additional XP
system sounds (error chimes, notification pops, etc.).

Only 5 of these files are currently wired into the app, and those live at
`public/sounds/` in normalized lowercase filenames (`startup.wav`,
`login.wav`, `logoff.wav`, `shutdown.wav`, `balloon.wav`). Everything in
this subfolder is dormant reference material.

When you wire a new sound, copy the chosen WAV into `public/sounds/` with a
short lowercase filename and reference it from `audioManager.ts`. Do NOT
move the full subfolder back into `public/` — it used to live there and was
relocated out because Astro was shipping the entire ~2.9 MB library on
every page load.
