# Simulator verification: 18 October 2026

This audit checks the implemented practice workflows, not all features of the real apps or hardware. The current combined release is [GitHub Pages](https://richzhou.github.io/hockey-clock-simulator/); older ChatGPT Sites copies can differ.

## References

- [Official Spordle scorekeeping guide](https://help.spordle.com/space/PLD/3489202177/Scorekeeper+guide), including pregame, penalties, goals, goalies, shots, corrections and End Game.
- [PCAHA 2026-27 training video](https://pcaha.ca/wp-content/uploads/2026/09/2026-2027_PCAHA_Spordle_Scorekeepers_Training_FINAL.mp4), reviewed through slide frames. Relevant slide headings: Enter the Scorekeeper & Timekeeper; A penalty is called; Penalty entry checklist; Edit or delete a goal or penalty; Period times can also be corrected; Sign / Review / Submit / Sync / Finish. Audio was not transcribed.
- [Nevco 871 manual 135-0066](https://nevcodocs.s3.amazonaws.com/Controls/MPC-6/Hockey/871.PDF), especially printed pages 1-9 for startup, time, scores, penalties, shots and timeout controls.
- [Nevco MPC-7 hockey manual 135-0222R](https://nevcodocs.s3.amazonaws.com/Controls/MPC-7/Hockey.PDF), especially printed pages 7-19 for time, stats, penalty entry, edit/clear and penalty pause options. Button symbols were inspected visually.
- User's City of Burnaby quick-reference photo, its [public counterpart](https://burnabywildcats.ca/wp-content/uploads/2025/04/City-of-Burnaby-Clock-Instructions.pdf), and the [older Kensington / Burnaby Lake sheets](https://www.burnabyminor.com/wp-content/uploads/sites/1604/2023/10/BLA-Kensington-arena-clocks.pdf).

## Browser coverage

Playwright uses installed Chrome with separate test contexts and fictional data. Initial checks ran against the public GitHub Pages release; corrections were retested on an isolated loopback server. Screenshots and raw logs remain outside Git.

| Suite | Coverage |
| --- | --- |
| Scorekeeper scenario matrix | All 11 scenarios on desktop and phone, assisted and unassisted: 44 unique runs, 232 scenario steps. |
| Mistakes and Help | Each run deliberately saves an incorrect entry, checks that state/progress stay unchanged, opens Help without losing form values, corrects the entry and completes. Unassisted practice requests Help at every step, including End Game and sync. |
| Focused scorekeeper controls | Desktop/phone lookup and removal, pregame gating, Major/Match time-first entry, code search, default versus manually changed Start Time, penalty edit retaining release, historical goalie edits, Pull/Return, official no-show/replacement and roster attendance. |
| Independent saved-entry corrections | Edit a saved goal, cancel deletion, confirm deletion of the chosen goal/penalty and preserve unrelated records. |
| Full review | Checks actual/final times, period lengths, corrected scorer/assists, carry-over release, lineups and goalie-period shots in the visible review. |
| Clock walkthrough/manual suite | All 29 871 and 23 MPC-7 short walkthroughs plus independent manual/photo sequences: 84 checks. |
| Clock full games | Both models, desktop/phone, assisted/unassisted: 8 complete games of 69 events, with Help, wrong-key recovery, warm-up, intermissions, concurrent/carry-over penalties and final score. |
| Clock portrait | Both models at 375x667, 390x844 and 430x932: 6 runs covering live board, hide/show while running, long hints, rotation and fit. |
| Power and navigation | Cancel/Escape/confirm power changes on both models and viewport types; clock-to-scorekeeper link and shared Home navigation at 320, 375 and 1440px. |
| Model checks | 153 passing tests across clocks and scorekeeper. |

## Findings and corrections

- Help was blocked behind scorekeeper entry dialogs. Each entry dialog now has Help, preserving its draft when Help closes.
- Requesting Help at simulated sync erased its completion control. Guidance redraws now retain that control.
- Review Game previously showed totals only. It now exposes the full recorded sheet by period, game times, participants and shots for review before initials.
- The clock task picker needed scrolling at a short landscape size. Its spacing/text sizing now fits the tested picker, including the start control.
- Added the requested clock-toolbar link to scorekeeping and the pregame note that the team manager may already have completed the details.

## Penalty entry order

The scorekeeper penalty form supports time-first entry. Tests enter Off and Start Time before player/infraction selection and verify that both survive choosing Major/Match and a serving skater. The video has two examples: the regular-minor slide lists player and infraction before times; its Major/Match checklist begins with confirming Off/Start Time before selecting offender and server. The Major/Match hints now explicitly practise time-first entry. Off/Start are arena-clock readings; duration is selected through the assessed penalty type.

Clock entry is different: 871 enters duration before player number; MPC-7 enters player number before accepting/changing its duration. These were checked separately against the corresponding manuals.

## Accuracy boundaries

- The written Spordle guide puts final clock and actual start/end times before review, officials, submission and sync. The video presents a conflicting order. Practice follows the written sequence and discloses this conflict; current league instructions take precedence.
- The scorekeeper lookup, rosters, initials, submission and sync are fictional/local. No real Spordle or HCR account is queried. Exact regional penalty-code mappings, eligibility, every combined charge and overtime/shootout remain outside scope.
- The old Kensington/Burnaby Lake sheets do not identify MPC-7 and describe legacy sequences. The grouped arena option is the requested practice setup, not proof of installed hardware; MPC-7 behavior follows its manufacturer manual and sample profile.
- Clock advanced configuration, pairing and accessories remain outside scope. Test success does not establish equivalence for every firmware, saved profile or arena configuration.

## Repeat the checks

Run `node --test engine.test.js walkthroughs.test.js mpc7.test.js full-game.test.js scorekeeper.test.cjs`.

With Playwright available, run `node scorekeeper.browser.test.cjs` and `node scorekeeper-controls.browser.test.cjs`. Set `PLAYWRIGHT_MODULE` when using an existing module outside the repository. `SIMULATOR_BASE_URL=https://richzhou.github.io/hockey-clock-simulator` targets the combined public site. `SCOREKEEPER_VIEW=desktop` or `phone` splits the matrix; `SCOREKEEPER_TASKS=major,match` selects specific scenarios for retesting.

Serve the repository locally, then point `browser.test.cjs`, `full-game.browser.test.cjs`, `portrait.browser.test.cjs` and `power.browser.test.cjs` at its `/dist/` URL. The ordinary clock browser suite accepts empty stdin; no account token is needed for GitHub Pages or loopback.
