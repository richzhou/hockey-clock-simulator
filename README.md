# Hockey clock practice: Nevco 871 and MPC-7

A browser-based practice simulator created for **Burnaby minor hockey volunteer scorekeepers and timekeepers**. Practice setting the clock, recording goals, entering penalties and managing period breaks before working a game. Use a mouse, touchscreen or keyboard to operate the simulated console.

**This is an independent, unofficial practice tool, not official training material from Burnaby Minor Hockey, the City of Burnaby or Nevco.** It supplements the current instructions and hands-on orientation provided by your association and arena. Follow your league's rules, the arena's actual console configuration and the game officials' directions.

## Try the published app

- **[Open the simulator on GitHub Pages](https://richzhou.github.io/hockey-clock-simulator/)**
- [Open the ChatGPT-hosted version](https://hockey-clock.chirpyvine19.chatgpt.site/)
- [View the source on GitHub](https://github.com/richzhou/hockey-clock-simulator)

Published copies can be on different versions and may lag behind the latest source in this repository.

## Getting started

1. Choose the arena/controller in the top bar: **Rosemary Brown Arena · Nevco 871** or **Kensington / Burnaby Lake · MPC-7 series**. The latter is a shared practice option; see the arena-identification notes below for the evidence and limitations.
2. Open **Walkthroughs** to pick an individual task or a full-game scenario.
3. Choose assisted training for instructions and highlighted keys, or unassisted full-game training with **Help** available when needed.
4. On a phone, use **Hide board / Show board** to control the scoreboard display. The console supports portrait use.

The full-game scenario covers a 5-minute warm-up, three 15-minute periods, 1-minute intermissions, goals and concurrent and carry-over penalties. Free practice lets you explore the controls without a guide.

## Run locally

Standalone HTML/CSS/JavaScript. Open `dist/index.html` or serve `dist/` with a static HTTP server. No other binary, database, or application packages are required.

## License

The simulator's original code and documentation are available under the [MIT License](LICENSE). Referenced manufacturer manuals, photos, trademarks and other third-party materials remain subject to their owners' rights and are not licensed by this project.

## Full game training

Open **Walkthroughs**, then choose **Start assisted game** or **Start unassisted game**. Both models use one continuous sample game: a 5-minute warm-up, three 15-minute periods, two 1-minute intermissions, goals, concurrent minors on one team, penalties on both teams, selection and removal of the instructed second penalty, and penalties carried across both period boundaries. The final score is Home 3, Guest 1.

Assisted mode lists the remaining keys and highlights the next control. Unassisted mode gives event cues without key instructions or highlights; **Help** reveals assistance for that event only. The completion screen reports mistakes and help requests. A wrong key names the mistaken key and the correct next control. Full-game training restores the console to the state immediately before that key, preserving correct digits and earlier game progress, so the user can continue directly. This coaching recovery also reveals the current guidance in unassisted mode until the next correct key. Free practice and the short walkthroughs retain normal console behavior. **Retry event** remains available for an unexpected result mismatch.

Training time pauses at event cues while the operator responds. During play, **Skip to event** advances the real simulator clocks and penalty queues to the next cue; it never skips a required clock, score or penalty action. The handheld still needs to be moved OFF at each whistle and after each period-ending horn. Each model starts with penalty pause enabled in the sample setup; those settings and durations are practice choices, not verified arena configuration. At period end, both the main and penalty clocks stop automatically. Move the handheld to OFF. This scenario runs the intermission on the main clock, so each period-end cue reminds the operator to pause penalties. Press PENALTY ON/OFF and verify PENALTY CLOCKS PAUSED before starting the 1-minute break. Before the next faceoff, press PENALTY ON/OFF again and verify PENALTY CLOCKS ON. The button must be enabled in the console configuration. Intermissions preserve stored penalty time. Leaving training returns to the current game in free practice.

Run `node --test full-game.test.js` for scenario and checkpoint checks. Run `node full-game.browser.test.cjs` with Playwright available to play both models in the browser. Existing short walkthroughs remain available in the same picker.

## Manual and training scope

Primary reference: Nevco MPC-6 hockey manual 135-0066, revision 2011-01-21:
https://nevcodocs.s3.amazonaws.com/Controls/MPC-6/Hockey/871.PDF

The two 5-by-4 key panels follow its model-code 871 overlay. Core controls follow the manual's documented operating sequences. Unsupported configuration opens a notice outside the machine rather than an invented hardware menu.

| Manual area | Implemented behavior | Printed pages |
| --- | --- | --- |
| Wired startup | Resume saved state, or enter model 871; then choose penalty time out | 1-2 |
| Main clock | SET → TIME; partial time digits default to zero; YES accepts; period digit completes entry | 3, 7 |
| Input correction | NO erases the last time digit; NO with no digits cancels without changing time | 7 |
| Time control | TIME ON/OFF starts/stops main and enabled penalty clocks; TIME OFF silences automatic horn | 3-4, 7 |
| Scores and shots | Add with a single digit; correct totals with SET and the appropriate team key; score limit 199, shots limit 99 | 7, 9 |
| Goal indicator | Toggles separately from score | 9 |
| Penalties | Add time/player, cycle entries, insert, edit time, cancel or confirm clearing | 8 |
| Penalty time out | PENALTY ON/OFF only pauses penalties when enabled at startup | 1, 9 |
| Timeout 0 | 30 seconds, warning at 10, overrun after zero, TIME ON cancels; CLEAR skips to warning or cancels | 5 |
| Operator display | Time-entry placeholders, current totals in add mode, tenths, timeout/main time recall | 3-9 |
| Horn | Mouse press/release, maximum four seconds; SET → HORN controls automatic horn | 4 |

The original Nevco MPC operator handbook gives the digit-by-digit NO example (0800 → NO → 08:0S.s):
https://manualzz.com/doc/24034754/nevco-mpc-scoreboard-control-operator%E2%80%99s-instructions
This supplements the hockey manual's instruction that NO backs up time entry.

The manufacturer's wired startup and the user-provided arena quick-reference card differ: the card includes a shot-clock question. They are separate, explicitly named walkthroughs. The arena reference-card profile is the default, matching the user’s photo. The photo is not bundled.

The user's photo explicitly permits more than two penalties per team while only two appear on the scoreboard. Additional entries are stored, can be recalled on the operator display, and move onto the scoreboard when an active penalty expires or is cleared. The original manufacturer MPC handbook (Penalty Timer Operation, printed pages 3-4) corroborates that a promoted penalty begins counting. Two distinct players can serve at once per team; successive penalties for the same player are served in order. A small status outside the machine shows how many additional entries are stored, without exposing extra entries on the scoreboard.

The matching public City of Burnaby quick-reference sheet is available here:
https://burnabywildcats.ca/wp-content/uploads/2025/04/City-of-Burnaby-Clock-Instructions.pdf
The pictured instructions were also checked directly using local text recognition to read the small footnote. The photo itself is not committed.

Wireless setup, bookmarks, accessory shot clocks, advanced SET OPTIONS configuration, programmable timeout banks, auxiliary/segment timers and chronometer configuration remain outside scope. The time-of-day display uses the computer's local clock. The simulated handheld connection and console time-key interlock follow the manual; no external hardware is connected. The visible TCS-5 handheld rocker starts and stops the clock as instructed in the photo.

This is an independent training aid for the implemented controls, not a manufacturer-certified complete controller emulator or an automated league-rule judge. Goal-based penalty removal always requires selecting and clearing the penalty the officials identify.

## Walkthroughs

Choose a model and one of its tasks (29 for 871, 23 for MPC-7), then Start walkthrough. Each loads a prepared game, explains the current step, highlights its next physical key and checks the outcome before advancing. Incorrect clicks still operate the console. A Practice hint outside the machine names the correct next action and offers Restart task. Free practice removes guidance while keeping the current game. Progress remains in this tab; reloading starts fresh.

Tasks cover both startup profiles, warm-up, first/next period setup, time correction (including NO), start/stop, home/guest goals, score and shots correction, home/guest penalties, concurrent same-team and opposing-team penalties, a third stored penalty and its promotion, editing/selecting/inserting/canceling/clearing penalties, a goal followed by instructed penalty removal, timeout, intermission and penalty carry-over.

Carry-over scenario: 10 seconds remain in period 1 with a 1:30 guest penalty. After the period ends, the penalty remains at 1:20 while the next period is entered, then resumes from that balance. Period-break scenarios pause penalty clocks before running a 3-minute period-0 break; the full intermission task re-enables penalties before play resumes. Warm-up is a separate 3-minute period-0 exercise. Durations are practice examples, not league requirements.

Timer accounting uses integer milliseconds and carries fractional browser intervals, preserving the exact remaining penalty at period end. Auto horn is synthesized audio. Sound starts disabled; game reset requires confirmation.

## Verification

State-machine and walkthrough checks:

```sh
node --test engine.test.js walkthroughs.test.js mpc7.test.js
```

Mouse-driven browser tests use `browser.test.cjs` with Playwright and an isolated headless Chrome profile. Install Playwright in your tooling environment, or set PLAYWRIGHT_MODULE to an existing package path. The script uses the installed Chrome channel and does not install packages or change a personal browser profile.

Serve `dist/` on port 8871, then run:

```sh
node browser.test.cjs http://127.0.0.1:8871 < /dev/null
```

Optional arguments after the URL are the source directory and a screenshot/report directory (defaults to the OS temporary directory). The runner clicks every walkthrough, exercises independent manual sequences, mistakes and recovery, NO correction, timeout, horn, unsupported-feature boundaries, desktop and 390px mobile layout. It rejects page JavaScript errors and saves results.json plus screenshots. For the private published site, an authorized ephemeral browser token can be provided through hidden stdin; never put it in command arguments or files.

Browser checks use real elapsed time, including reaching period end and inspecting the retained penalty. They supplement state-machine tests; passing application tests alone does not establish fidelity for unsupported hardware configurations.

## Photo-specific verification

`browser.test.cjs` contains independent PHOTO checks transcribed from the supplied quick-reference card rather than deriving them from the walkthrough definitions. They cover: startup (NO, 871, NO shot clock, NO penalty time out); warm-up/period entry and the attached switch; adding and replacing both scores; penalty entry with leading zeros; penalty editing; clearing after recording a goal; and the footnote allowing extra entries while only two display. The suite verifies the stored third penalty is recalled on the operator console and appears on the scoreboard when an older penalty expires. It saves `photo-penalty-promotion.png` as evidence.

## Mobile practice controls

A top control bar contains the machine-model selector (Rosemary Brown Arena · Nevco 871, or Kensington / Burnaby Lake · MPC-7 series), Walkthroughs, Scoreboard and More. Walkthroughs opens a task picker; starting closes it and loads the console. Browsing or dismissing the picker preserves the active task. Restart always restarts the active task, including after browsing another task. Changing models starts a fresh sample game and replaces the keypad, handheld label, walkthroughs and quick reference together. Selecting the same model preserves practice.

Mobile keeps the complete current instruction, next key and a concise mistake hint alongside the machine in landscape, or above it in portrait. Restart and Free practice remain on that instruction card. Task selection, current instructions and the keys require no page scrolling at tested phone sizes; portrait shows a compact live scoreboard above the console by default, with Hide board / Show board in the toolbar. Landscape keeps the separate scoreboard view. Hiding the portrait board preserves all clocks, entries, penalties and task progress, and that visibility choice survives rotation and model changes within the tab. More opens sound, speed, new game and quick reference in a dialog. The handheld remains beside the console. Rotating preserves the current game and task. Portrait practice has no rotation reminder; safe-area padding protects phone cutouts and the home indicator.

## Handheld switch

A separate corded TCS-5 appears beside the console, with a coiled lead, status LED, momentary horn push button and OFF/ON time rocker. It starts connected. Click the left half of the rocker for OFF, the right half for ON, or focus it and use Space/Enter to toggle. The switch position stays ON at period end; move it OFF then ON to start the next period. Enabled penalties follow the main clock.

TIME ON/OFF console keys are inactive while attached. Unplugging while powered keeps these keys inactive until the control is turned off and restarted; powering off, unplugging and restarting enables the keys. Clicking the console power button opens a confirmation for both power on and power off. Cancel or Escape keeps the current power state and practice step; the clock continues while confirmation is open. Confirming applies the power action once. Model-code entry preserves the connection. Starting a prepared practice game resets the rocker to OFF. The horn sounds while pressed, stops on release (including release outside the button), and stops after four seconds even if still held. It works without changing SET entries. Keyboard and pointer operation are supported.

The manufacturer manual documents the TCS-5 controls in figures 1–2 and the time-key interlock on printed pages 7 and 15–16. Walkthrough instructions and highlighted controls point to the handheld when attached. The added “Use the handheld clock switch” task practices starting/stopping and explains the interlock. Mobile layouts retain the handheld, machine and current instruction without page scrolling at tested sizes.


## MPC-7 series and arena identification

Kensington’s MPC-7 series identification comes from the user. The new supplied arena guide is an older, undated Kensington sheet paired with a Burnaby Lake sheet dated March 2007:
https://www.burnabyminor.com/wp-content/uploads/sites/1604/2023/10/BLA-Kensington-arena-clocks.pdf

Neither sheet names a controller model or provides a controller photo. Both use older SET/TIME → period and team PENALTY sequences; the Burnaby Lake sheet additionally names PENALTY CLEAR and the shot-clock/penalty-time-out startup prompts. Those procedures resemble the older MPC/871 interface rather than the current MPC-7 manual. This is evidence of legacy operating procedures, not proof of the present controller installation. At the user’s request, Kensington and Burnaby Lake share one MPC-7 practice option. This is a requested arena grouping, not independent confirmation of the currently installed controller at either arena. More → Arena and model references retains this distinction.

MPC-7 implementation reference: manufacturer MPCW-7 hockey manual 135-0222R (cover dated 2021-02-13), from Nevco’s official MPC-7 documentation:
https://nevcodocs.s3.amazonaws.com/Controls/MPC-7/Hockey.PDF

The two 5-by-4 banks match the manual’s hockey overlay: green home column, blue guests column, dedicated minor/major/view/saves/shots keys, PERIOD, GOAL LIGHT RESET, SCROLL PROFILES and TIME OUT TIMER. The casing is rendered in HTML/CSS; the supplied PDF is not bundled. TCS-7 replaces the TCS-5 label and flashes its connected indicator.

| MPC-7 manual area | Implemented difference from 871 | Printed pages |
| --- | --- | --- |
| New game | Preconfigured 96-HOCKEY profile: SCROLL PROFILES → YES; no 871-code startup | 1, 4 |
| Main time | SET → TIME → MMSSs autoaccepts five digits; YES zero-fills partial input; NO cancels the entire unaccepted entry | 5, 8 |
| Period | PERIOD → digit; time entry never prompts for the period | 9 |
| Stats | A digit adds once, then the stat key must be selected again; scores illuminate the goal indicator; GOAL LIGHT RESET clears indicators | 11–12, 15, 17 |
| New penalties | Team NEW MINOR/MAJOR → player → YES for preset or M SS for custom duration | 13–14 |
| View, insert, edit | Team VIEW PENALTY cycles; insertion/editing use player-first entry; YES retains existing player/time during edit | 14, 16–17 |
| Clear | VIEW PENALTY → CLEAR PENALTY removes immediately, without YES confirmation | 17 |
| Queue | Two distinct active players per team; later entries and successive same-player penalties wait; at most 20 per team | 14 |
| Timeouts | Clock must be stopped; choose 1–5; repeated TIME OUT TIMER skips to warning, then ends the timeout | 9–10 |
| Penalty options | Enable Button toggles pause key; Minor/Major sets default duration; OPTIONS cycles and YES selects; NO exits | 18–19 |
| Handheld | Connected TCS-7 controls time, console time keys interlocked, restart required after unplugging | 7 |

The sample hockey profile uses minor 2:00, major 5:00 and timer durations [0:30, 2:00, 1:00, 0:30, 1:00], with a 10-second timeout warning. These are practice values, not verified Kensington or Burnaby Lake settings. Penalty pause starts disabled; the intermission guide enables it through Penalties options. Menu order is an explicit training order; firmware and saved profiles may differ. Wireless pairing, profile editing, other sports, electronic team names, auxiliary/segment timers, interval horn, shot-clock accessories and other advanced options remain outside scope. Unsupported menu selections display a notice outside the machine.

MPC-7 tests include all 23 walkthrough outcomes plus independent manual-derived checks for five-digit time autoaccept, whole-entry cancellation, one-shot score addition, goal light reset, player-first entry, immediate clear, edit/insert, invalid seconds, 20-entry capacity, queued same-player penalties and the handheld interlock. Browser checks click every MPC-7 task, verify switching back restores 871 behavior, and capture desktop plus landscape/portrait layouts without page scrolling. Screenshots and generated reports stay in the OS temporary directory.


### Portrait scoreboard verification

`portrait.browser.test.cjs` checks the live board alongside the console on 375×667, 390×844 and 430×932 touch viewports for both controllers. It checks scores and two penalties per team, full-screen fit, long instruction/mistake hints, hiding while clocks run, restoring without resetting task progress, and rotation between portrait and landscape. Run with an existing Playwright package:

```sh
PLAYWRIGHT_MODULE=/path/to/playwright node portrait.browser.test.cjs http://127.0.0.1:8871
```

The portrait board omits goal saves to retain room for time, scores, shots and active penalties. Hide board frees space for the console; Show board restores it. This does not change the controller state.


### Selecting one of two penalties to clear

Both models’ main clear walkthrough is named **Clear one of two penalties: select player 18**. The sample has guest players 12 (1:30) and 18 (2:00). It separates recalling player 12, pressing the same team penalty key again to select player 18, and clearing that displayed entry. It verifies that player 12 remains at 1:30. Selection happens with the console keys and operator display, not by clicking a scoreboard row or using SET. The instructions explain that HOME works the same way.

Manual evidence: 871 printed page 8 (PDF page 13) says each HOME/GUEST PENALTY press recalls the next entry and the list starts over after the last. PENALTY CLEAR opens CLEAR (Y-N), then YES removes it. MPC-7 printed page 14 (PDF page 21) shows repeated team VIEW PENALTY keys for scrolling; printed page 17 (PDF page 24) clears the displayed penalty directly with CLEAR PENALTY. No controller behavior was changed for this clarification.


The MPC-7 “Edit a penalty’s time and player” walkthrough explains confirmation at each field: YES retains the existing player or time, while a complete replacement advances automatically. The exercise deliberately changes both fields (12 → 18, 2:00 → 1:30), so it does not insert an extra YES. For a time-only correction, retain the player with YES before entering M SS. This follows the manufacturer’s edit sequence on printed page 17.
