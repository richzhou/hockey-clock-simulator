# Rinkside Scorekeeper Practice

An independent, mobile-friendly practice simulator for Burnaby minor hockey volunteer scorekeepers. Rehearse a fictional electronic scoresheet before game day, without touching any real game.

**Unofficial. Not affiliated with, sponsored, approved or endorsed by Spordle, PCAHA, BC Hockey, Burnaby Minor Hockey, the City of Burnaby or any manufacturer. This is not official training, certification or an official game record.** Use current official instructions and game officials for final guidance.

## Open the app

[Scorekeeper practice](https://richzhou.github.io/hockey-clock-simulator/scorekeeper/) · [All practice tools](https://richzhou.github.io/hockey-clock-simulator/)

## Run locally

Open `scorekeeper/index.html` from the combined repository in a browser. It is a buildless HTML/CSS/JavaScript app. No account, database or application packages are needed. Everything is fictional and stays in the tab; closing or reloading resets the exercise. Do not enter real player data, credentials, signatures or team identifiers.

The app fills the viewport, with no branding header or disclaimer footer. **← Home** returns to the shared tool picker. The initial acknowledgement and **About** keep limitations and official-help links available. The coach stays visible while the scoresheet scrolls independently.

The sample team has 16 fictional players in total: 14 skaters plus two goalies. This is a practice roster, not a claim about league roster limits. Pregame attendance selections control which skaters appear in goal and penalty pickers. The charcoal panels, blue action buttons, dark entry dialogs and green/yellow/white player selections follow the app shown in the supplied training video; the simulator retains its own name and disclaimer.

Choose **Choose practice** for a full game or a focused task. Assisted mode shows instructions. Unassisted mode shows events and offers Help. An incorrect saved answer explains what to fix and leaves the form open without changing the practice sheet.

The full game contains pregame checks, three periods, goals and assists, a corrected scorer, a power-play penalty release, concurrent penalties, a carry-over penalty, a goalie change, period-length correction, bench penalty, optional shots/notes and final sign-off. Period lengths and game events are sample exercises, not league rules. There is no running arena clock or automatic penalty/manpower decision.

## Source references and fidelity

Primary visual reference: [PCAHA 2026–27 scorekeeper training video](https://pcaha.ca/wp-content/uploads/2026/09/2026-2027_PCAHA_Spordle_Scorekeepers_Training_FINAL.mp4), reviewed as extracted slide frames across its 8m41s duration. Audio was not transcribed. Relevant references include pregame/login around 1:15–2:30, goals around 3:30, penalties around 4:00, goalie changes around 5:00, corrections around 6:45 and wrap-up around 7:45–8:30.

Cross-reference: [official Spordle scorekeeper help](https://help.spordle.com/space/PLD/3489202177/Scorekeeper+guide) and [PCAHA manager resources](https://pcaha.ca/resources/team-managers/).

The wrap-up now follows the written Spordle guide: final clock and actual start/end times, review with off-ice initials, game officials’ review/initials and Done, Submit, then sync and Finish. The supplied PCAHA video presents a different sequence. The simulator states this conflict rather than treating either source as proof of the current live app. Confirm the procedure used by your league. Simulated sync is advanced using a control outside the fictional app; no real submission occurs.

The Start Game wizard has separate period-length and time-entry screens with Next before Remaining Time / Start. Roster practice walks through players, bench staff and fictional coach confirmation. Actual PCAHA rosters remain the team manager’s responsibility. Game Officials supports name corrections, Did not show / Remove and a temporary fictional replacement. Pregame details can be revisited during free practice.

Goalie controls use Swap, Pull and Return. Current goalie is recalculated from the timeline when an earlier change is edited or deleted. Shots are recorded against each goalie in each period and summed for the opposing shooting team. The guide counts shots, not saves. The PCAHA video’s alternative paper/Notes instruction remains linked. Only track shots when your league requires them.

Penalty Start Time follows Off Time until manually changed. Ended penalties retain their end when edited; an edit that would place the start after the recorded end is rejected. Opportunities can be entered as 0–2 for these exercises. By-code and by-section search covers the minor-hockey rule headings in [Hockey Canada’s 2026–28 rulebook](https://www.hockeycanada.ca/en-ca/hockey-programs/officiating/downloads), not a proprietary regional Spordle code database. Junior/Senior-only choices are excluded. Major includes Game Misconduct, and Major/Match require a different serving skater. Dedicated exercises cover those selections. The referee supplies the assessment and release: this is not a penalty-rules or eligibility engine. Every regional code, combined charge, overtime/shootout scenario, real offline sync and live submission remain outside this simulator.

The screens, styling and implementation are original. No Spordle logos, proprietary source, screenshot assets, video footage or real rosters are included. Third-party names and linked materials belong to their owners. MIT applies only to the original project code; linked reference material is not relicensed.

## Tests

From the repository root: `node --test scorekeeper.test.cjs`

`node scorekeeper.browser.test.cjs` uses Playwright and installed Chrome. Set `PLAYWRIGHT_MODULE` to the module path if it is not installed normally. It serves this repository on loopback and tests the home page and both simulators. `node scorekeeper-controls.browser.test.cjs` covers Major/Match entries, rule search, the editable Start Time, preserving penalty ends, historical goalie corrections, Pull/Return and no-show replacement on phone and desktop.

Both simulators are published together through the hockey-clock-simulator GitHub repository. It has no connection to VersaCloudERP, even when stored beside that checkout locally.
