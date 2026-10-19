# Simulator verification: 18 October 2026

This audit checks the implemented practice workflows, not all features of the real apps or hardware. The current combined release is [GitHub Pages](https://richzhou.github.io/hockey-clock-simulator/); older ChatGPT Sites copies can differ.

## References

- [Official Spordle scorekeeping guide](https://help.spordle.com/space/PLD/3489202177/Scorekeeper+guide), including pregame, penalties, goals, goalies, shots, corrections and End Game.
- [PCAHA 2026-27 training video](https://pcaha.ca/wp-content/uploads/2026/09/2026-2027_PCAHA_Spordle_Scorekeepers_Training_FINAL.mp4), reviewed through slide frames. Relevant slide headings: Enter the Scorekeeper & Timekeeper; A penalty is called; Penalty entry checklist; Edit or delete a goal or penalty; Period times can also be corrected; Sign / Review / Submit / Sync / Finish. Audio was not transcribed.
- [Nevco 871 manual 135-0066](https://nevcodocs.s3.amazonaws.com/Controls/MPC-6/Hockey/871.PDF), especially printed pages 1-9 for startup, time, scores, penalties, shots and timeout controls.
- [Nevco MPC-7 hockey manual 135-0222R](https://nevcodocs.s3.amazonaws.com/Controls/MPC-7/Hockey.PDF), especially printed pages 7-19 for time, stats, penalty entry, edit/clear and penalty pause options. Button symbols were inspected visually.
- User's City of Burnaby quick-reference photo, its [public counterpart](https://burnabywildcats.ca/wp-content/uploads/2025/04/City-of-Burnaby-Clock-Instructions.pdf), and the [older Kensington / Burnaby Lake sheets](https://www.burnabyminor.com/wp-content/uploads/sites/1604/2023/10/BLA-Kensington-arena-clocks.pdf).

## Browser coverage

Playwright uses installed Chrome with separate test contexts and fictional data. Initial checks ran against the public GitHub Pages release; corrections were retested on an isolated loopback server. Screenshots and raw logs remain outside Git. After deployment, desktop and phone smoke checks passed for the public clock link, manager note, Help inside entry forms, correction without losing values, full review, Help during sync and time-first Major instructions.

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
| Model checks | 161 passing tests across clocks and scorekeeper. |

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

## Follow-up: official screenshot alignment

The official help page exposes full-resolution screenshot attachments. These were downloaded only to temporary reference files and inspected visually after the workflow audit; they are not bundled with the simulator. The guide reports a 15 December 2025 update, and individual screenshots can represent different versions/settings. No live Spordle account was used to confirm current production screens.

| Official screenshot | Implemented alignment and limits |
| --- | --- |
| [Start Game](https://help.spordle.com/download/attachments/3489202177/Scorekeeper%20F32.png) | Actual start time is required at Start Game, validated and retained through End Game. Exercises cover three regulation periods; overtime remains outside scope. |
| [Time-entry choice](https://help.spordle.com/download/attachments/3489202177/Scorekeeper%20F33.png) | Elapsed Time, Remaining Time and Previous are available. Previous preserves start time and period lengths. Guided exercises require Remaining Time; free practice supports elapsed chronology. |
| [Infraction by section](https://help.spordle.com/download/attachments/3489202177/Scorekeeper%2083.png) | Separate Select Infraction screen with infraction-specific assessment choices. Selecting, cancelling, Escape and Help preserve the parent penalty draft and Off/Start readings. |
| [Infraction by code](https://help.spordle.com/download/attachments/3489202177/Scorekeeper%2081.png) | Slashing includes the verified screenshot examples A22, B22 + D22 and B22 + E22, labelled as guide examples. Other entries use Hockey Canada rule references; the complete current regional codebook and every combined charge are not reproduced. |
| [Review Game](https://help.spordle.com/download/attachments/3489202177/Scorekeeper%20A.png) | Back, Edit and Delete are available. Corrections preserve final times and invalidate sign-off. Officials Back requires re-review and initials. Guided corrections/navigation retain exercise progress. |
| [Goalie change](https://help.spordle.com/download/attachments/3489202177/Scorekeeper%2093.png) | Selectable goalie masks, outgoing/incoming labels and Swap/Pull/Return. Historical edits calculate the outgoing goalie at that event. |
| [Penalty participants](https://help.spordle.com/download/attachments/3489202177/Scorekeeper%20F34.png) | Original CSS jerseys, goalie masks, coach jackets and bench shapes distinguish participant roles. No official screenshot assets are bundled. |

The follow-up passed all 44 local scenario runs, detailed control checks on desktop and phone, and 161 combined model tests. Focused checks cover actual-start validation, Previous, elapsed chronology, separate infraction selection/cancellation, goalie masks, review correction/deletion, Back and sign-off invalidation, and contextual Help after Back. Penalty menus were cross-checked against the relevant Hockey Canada 2026–28 rule subsections; the referee still supplies the actual assessment. These checks verify the implemented exercises, not every official screen, regional setting or current live-app version.

## Published follow-up verification

GitHub Pages successfully deployed application commit `e7b7241`. Playwright then passed the detailed control suite on desktop and phone and 24 public scenario runs: full game, pregame, Major, Match, goalie and wrap-up, each assisted/unassisted on both viewport types. Shared navigation at 320, 375 and 1440px and both clock-model smoke checks also passed. The navigation test now waits for the clock page to finish loading before checking its opening acknowledgement; the initial public attempt exposed a test timing race, not a simulator failure.

## Repeat the checks

Run `node --test engine.test.js walkthroughs.test.js mpc7.test.js full-game.test.js scorekeeper.test.cjs`.

With Playwright available, run `node scorekeeper.browser.test.cjs` and `node scorekeeper-controls.browser.test.cjs`. Set `PLAYWRIGHT_MODULE` when using an existing module outside the repository. `SIMULATOR_BASE_URL=https://richzhou.github.io/hockey-clock-simulator` targets the combined public site. `SCOREKEEPER_VIEW=desktop` or `phone` splits the matrix; `SCOREKEEPER_TASKS=major,match` selects specific scenarios for retesting.

Serve the repository locally, then point `browser.test.cjs`, `full-game.browser.test.cjs`, `portrait.browser.test.cjs` and `power.browser.test.cjs` at its `/dist/` URL. The ordinary clock browser suite accepts empty stdin; no account token is needed for GitHub Pages or loopback.

## Compact practice menu: 19 October 2026

After a successful demo login, or when opening a task that starts in-game, the practice controls and coach collapse into one row. Its toggle restores Home, Choose practice, About and guidance without changing the game. Help, error feedback and the simulated-sync action remain accessible while compact; successful-save notices do not consume extra space. The toggle displays the current task step or completion.

Passed 161 model checks, the detailed desktop/phone control suite, and full-game/wrap-up runs in assisted and unassisted modes on both screen sizes (8 runs). Browser checks confirm automatic collapse below 60px, expand/collapse without state changes, visible Help, wrong-entry recovery and completion through sync. The phone layout was inspected visually. Both clock models and shared navigation smoke checks passed.

## One-click pregame shortcut: 19 October 2026

Demo login and pregame offer Skip pregame setup → Start playing. It fills the canonical fictional rosters, selected volunteers and officials, sets three 15-minute periods with actual start 18:00 and Remaining Time, then starts with no events. Partial setup is replaced with sample values. Full-game training resumes at the opening goal; ordinary setup remains available.

Passed 163 model tests, desktop/phone quick-start checks after partial setup (including recording a goal), normal setup/control regressions, and all 25 remaining full-game steps after skipping in assisted/unassisted mode on desktop and phone (4 runs). These runs include mistakes, Help, concurrent and carry-over penalties and final sign-off. Both clock smoke checks and shared navigation passed.

## Phone action alignment and screenshot palette: 19 October 2026

The official [game-screen screenshot](https://help.spordle.com/download/attachments/3489202177/Scorekeeper%2035.png) shows Away Goal and Home Goal beside each other, in a six-button mirrored row. The previous phone stylesheet wrapped Away actions into one row and Home actions into another, breaking the goal pair. At widths through 600px the simulator now uses two columns, Away left and Home right: Goals, Penalties and Goalies each share a row. Wider views retain the six-button reference arrangement. This phone adaptation preserves the reference’s team/action relationships; the linked screenshot itself is a wide-screen reference, not proof of the official phone layout.

Colours were sampled from the official game screen and the guide’s [penalty](https://help.spordle.com/download/attachments/3489202177/Scorekeeper%20F34.png) and [goal](https://help.spordle.com/download/attachments/3489202177/Scorekeeper%20F37.png) screenshots: dark goals #003876, brighter penalty/goalie actions #0066a4, charcoal panels/fields, green scorer #299457, gold offender #c9a340 and white assists. Original CSS approximates the header background without copying logos or image assets.

Passed 163 model tests and the desktop/phone control suite. Geometry and computed-colour assertions cover both Home/Away buttons at 320, 375, 390, 430, 600, 768 and 1440px, including at least 44px touch heights and no horizontal overflow. Phone and desktop screenshots were inspected visually; normal setup, quick start, penalties, goalie changes, corrections, Help and wrap-up remained functional.

## Mobile entry, toolbar and active penalties: 19 October 2026

Compared the official guide’s [goal](https://help.spordle.com/download/attachments/3489202177/Scorekeeper%20F37.png), [penalty participants](https://help.spordle.com/download/attachments/3489202177/Scorekeeper%20F34.png), [penalty times](https://help.spordle.com/download/attachments/3489202177/Scorekeeper%20F35.png), [infraction](https://help.spordle.com/download/attachments/3489202177/Scorekeeper%2083.png), [goalie](https://help.spordle.com/download/attachments/3489202177/Scorekeeper%2093.png), [active penalty](https://help.spordle.com/download/attachments/3489202177/Scorekeeper%20F38.png) and [penalty end](https://help.spordle.com/download/attachments/3489202177/Scorekeeper%20F39.png) screenshots. These are wide reference screens; mobile layouts below are adaptations, not proof of identical official phone rendering.

- Entry screens fill the phone, retain a fixed labelled Help/Cancel header, and scroll the form independently. Save/Next remain accessible. Palette, panel hierarchy, larger period/time fields, options and goalie masks are consistent. Returning from infraction selection preserves values and body scroll position.
- The phone toolbar uses accessible icons for Pregame, Shots, Notes, Options and End Game; wide screens show text too. The official screenshot has End Game text and a stop icon. Scoresheet, Timeout and Spectators workflows remain outside scope.
- Game-clock fields keep MM:SS and accept a single-digit minute, as in the guide’s 5:30 example. Digits-only typing is not documented in that source. A simulator-specific colon button solves numeric-keypad input without claiming unverified official auto-formatting; it preserves Off/Start mirroring and does not insert a duplicate colon.
- Active penalties show serving-player jerseys, grouped Away/Home. Only unresolved timed entries appear; no countdown or automatic release is inferred. Penalty details show end time first, offender, serving player, assessment, Edit and End. Ending a selected concurrent penalty removes only its jersey and retains its history; ended records offer Edit end. Record rows use the guide’s white/blue presentation.

Passed 163 model checks, all 44 desktop/phone scenario runs in both assistance modes, and the detailed control suite. A focused browser suite at 320, 375, 430 and 768px verifies entry panel geometry, palette, labelled toolbar controls, goal/penalty/goalie saves, Help draft preservation, typing 03 then the colon control then 00, duplicate-colon prevention, serving-player identity and independent concurrent releases. Screenshots were visually inspected. The focused suite also accepts SIMULATOR_BASE_URL for public deployment checks.

## Full keyboard for game times: 19 October 2026

Removed the simulator-specific colon button at the user’s request. All shared game-clock fields now use text input mode instead of a numeric-only keypad; users enter 3:00 or 03:00 directly. The focused mobile suite checks the text keyboard request, absence of separator controls, direct colon typing, saves and draft preservation. This supersedes the colon-button workaround described in the preceding historical audit.

## Mobile End Game and sign-off: 19 October 2026

Compared official [End Game](https://help.spordle.com/download/attachments/3489202177/Scorekeeper%2099.png), [Review Game](https://help.spordle.com/download/attachments/3489202177/Scorekeeper%20A.png), [Game Officials](https://help.spordle.com/download/attachments/3489202177/Scorekeeper%20B.png), [Submit](https://help.spordle.com/download/attachments/3489202177/Scorekeeper%20C.png) and [Sync](https://help.spordle.com/download/attachments/3489202177/Scorekeeper%20D.png) screenshots.

Next and Done moved from the bottom of the page into the sticky top bar, alongside Back. Review Game and Game Officials have distinct stage indicators; every wrap-up stage now has an accurate header. Final clock and actual start/end are grouped into panels. Actual times use full-keyboard HH:MM text fields, retaining existing validation, because a native time picker could render AM/PM despite a 24-hour label. Submit and Sync panels share the guide palette; completed Sync has disabled Back and a right-aligned Finish.

The focused suite completes final times through Finish at 320, 375, 430 and 768px, checks top-action position while scrolling, required initials, Back clearing sign-off, re-review, Help during sync and no horizontal overflow. Full-game and wrap-up exercises pass in assisted/unassisted modes on desktop and phone (8 runs), along with 163 model checks and the detailed control suite. Mobile screenshots were visually inspected. The source screenshots are wide views; the phone arrangement is an adaptation. Fictional typed initials are retained; optional Add Email, real Game Report, real signatures and transmission remain outside scope.
