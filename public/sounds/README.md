# Sounds

Phase A polish (round 3): the three canonical WAVs at the root of this folder
are the real Microsoft Windows XP ceremony sounds, sourced from the Internet
Archive's `windowsxpstartup_201910` collection. Homage use, same posture as
mitchivin.com.

- `login.wav` — real XP Logon Sound. Plays when the user clicks the login avatar.
- `logoff.wav` — real XP Logoff Sound. Reserved for Phase C Turn Off dialog.
- `balloon.wav` — real XP Balloon notification. Plays with the welcome balloon ~2 s after login.

## Full XP sound library

`windowsxpstartup_201910/` contains the full archive.org collection (~30 WAV
files including Shutdown, Startup, Notify, Error, Ding, Recycle, etc.). Kept
in the repo as a reference library for future phases:

- Phase C (shutdown ceremony) will want `Windows XP Shutdown.wav`.
- Phase E (notifications) may want `Windows XP Notify.wav`, `Windows XP Ding.wav`, etc.

Do not reference files from this subfolder at runtime — copy/rename into
canonical root-level names when a phase consumes them, so the runtime path
stays stable regardless of collection reshuffles.

## Alternate-format duplicates

`Windows XP - Logoff sound [01].opus` and `Windows XP - Notify [01].opus` are
alternate-format duplicates from a different source. Not referenced at runtime.
