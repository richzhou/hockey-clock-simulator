# Rinkside Scorekeeper Practice

An independent, mobile-friendly practice simulator for Burnaby minor hockey volunteer scorekeepers. Rehearse a fictional electronic scoresheet before game day, without touching any real game.

**Unofficial. Not affiliated with, sponsored, approved or endorsed by Spordle, PCAHA, BC Hockey, Burnaby Minor Hockey, the City of Burnaby or any manufacturer. This is not official training, certification or an official game record.** Use current official instructions and game officials for final guidance.

## Open the app

[Scorekeeper practice](https://richzhou.github.io/hockey-clock-simulator/scorekeeper/) · [All practice tools](https://richzhou.github.io/hockey-clock-simulator/)

## Run locally

Open `scorekeeper/index.html` from the combined repository in a browser. It is a buildless HTML/CSS/JavaScript app. No account, database or application packages are needed. Everything is fictional and stays in the tab; closing or reloading resets the exercise. Do not enter real player data, credentials, signatures or team identifiers.

Choose **Choose practice** for a full game or a focused task. Assisted mode shows instructions. Unassisted mode shows events and offers Help. An incorrect saved answer explains what to fix and leaves the form open without changing the practice sheet.

The full game contains pregame checks, three periods, goals and assists, a corrected scorer, a power-play penalty release, concurrent penalties, a carry-over penalty, a goalie change, period-length correction, bench penalty, optional shots/notes and final sign-off. Period lengths and game events are sample exercises, not league rules. There is no running arena clock or automatic penalty/manpower decision.

## Source references and fidelity

Primary visual reference: [PCAHA 2026–27 scorekeeper training video](https://pcaha.ca/wp-content/uploads/2026/09/2026-2027_PCAHA_Spordle_Scorekeepers_Training_FINAL.mp4), reviewed as extracted slide frames across its 8m41s duration. Audio was not transcribed. Relevant references include pregame/login around 1:15–2:30, goals around 3:30, penalties around 4:00, goalie changes around 5:00, corrections around 6:45 and wrap-up around 7:45–8:30.

Cross-reference: [official Spordle scorekeeper help](https://help.spordle.com/space/PLD/3489202177/Scorekeeper+guide) and [PCAHA manager resources](https://pcaha.ca/resources/team-managers/).

The video’s final workflow is sign-off, officials review, submission, sync and final End Game fields. The general help page describes a different order. This simulator follows the video’s sequence, with an original practice wrap-up navigation; it does not claim to reproduce the current app exactly. The video recommends recording required shots by goalie on paper and using Notes. A separate simplified totals form is included for practice; confirm the real procedure with your league.

Penalty Off Time and Start Time are separate. A carry-over is one record across periods. Concurrent penalties are entered separately; the official decides offsets and releases. Common practice infractions only; Head Contact uses the video’s minor-hockey reference (7.6), with no Junior/Senior-only choices. Major/match ejections, every infraction code, eligibility, real offline synchronization and live submission are outside this simulator.

The screens, styling and implementation are original. No Spordle logos, proprietary source, screenshot assets, video footage or real rosters are included. Third-party names and linked materials belong to their owners. MIT applies only to the original project code; linked reference material is not relicensed.

## Tests

From the repository root: `node --test scorekeeper.test.cjs`

`node scorekeeper.browser.test.cjs` uses Playwright and installed Chrome. Set `PLAYWRIGHT_MODULE` to the module path if it is not installed normally. It serves this repository on loopback and tests the home page and both simulators.

Both simulators are published together through the hockey-clock-simulator GitHub repository. It has no connection to VersaCloudERP, even when stored beside that checkout locally.
