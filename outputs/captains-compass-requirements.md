# Captain's Compass Requirements

## Overview

Build a browser-based React game called **Captain's Compass**. The game teaches children how to use keyboard arrow keys by asking them to steer a ship in the direction called out by a friendly navigator parrot.

The player is the captain of a small ship. A cheerful parrot named **Pip** gives navigation orders. The player earns points by pressing the correct arrow key or arrow-key combination.

## Target Platform

- Browser-based web game
- Built with React
- Designed primarily for desktop browsers with a physical keyboard
- Responsive enough to fit common laptop and desktop screen sizes

## Core Learning Goal

The game should teach and reinforce:

- Single arrow key directions:
  - Up
  - Down
  - Left
  - Right
- Diagonal movement using two arrow keys together:
  - Up + Right
  - Up + Left
  - Down + Right
  - Down + Left

## Theme

The game uses a playful nautical theme.

Main elements:

- A small ship sailing on ocean waves
- A compass or direction indicator
- A navigator parrot named Pip
- Pip gives instructions through a speech bubble
- The player acts as the ship captain

## Characters

### Player

- Role: Captain of the ship
- Action: Presses arrow keys to steer
- Goal: Follow Pip's navigation orders and earn points

### Pip the Parrot

- Role: Navigator and coach
- Gives direction prompts
- Gives positive feedback for correct answers
- Gives gentle feedback for incorrect answers

Example direction prompts:

- "Captain, sail north!"
- "Steer south!"
- "Turn east!"
- "Head west!"
- "Turn northeast!"
- "Head northwest!"
- "Sail southeast!"
- "Swing southwest!"

Example correct feedback:

- "Aye aye, perfect!"
- "Smooth sailing!"
- "Great steering, Captain!"
- "That is the right heading!"

Example wrong feedback:

- "Oops, check the compass!"
- "Try that heading again!"
- "Almost, Captain!"
- "Let's steer the other way!"

## Gameplay

1. The player starts the game by clicking a **Start Game** button.
2. Pip displays a navigation order in a speech bubble.
3. The screen also shows the direction visually using text, an arrow, or a compass marker.
4. The player presses the matching arrow key or arrow-key combination.
5. If the input is correct:
   - The player earns 1 point.
   - The streak increases by 1.
   - Pip gives positive feedback.
   - The ship glides, points, or nudges in the requested direction.
   - A new random direction appears.
6. If the input is incorrect:
   - The score does not increase.
   - The streak resets to 0.
   - Pip gives gentle corrective feedback.
   - The ship wobbles or briefly drifts off course.
   - A new random direction appears.
7. The game continues until the timer reaches 0.
8. When time runs out, the game shows a final score and a restart option.

## Direction Challenges

Each direction challenge should be represented as structured data.

Example challenge shape:

```js
{
  label: "Northeast",
  display: "Up + Right",
  symbol: "↗",
  requiredKeys: ["ArrowUp", "ArrowRight"],
  prompt: "Turn northeast!"
}
```

Required challenges:

| Direction | Display Text | Required Keyboard Input |
| --- | --- | --- |
| North | Up | ArrowUp |
| South | Down | ArrowDown |
| West | Left | ArrowLeft |
| East | Right | ArrowRight |
| Northeast | Up + Right | ArrowUp + ArrowRight |
| Northwest | Up + Left | ArrowUp + ArrowLeft |
| Southeast | Down + Right | ArrowDown + ArrowRight |
| Southwest | Down + Left | ArrowDown + ArrowLeft |

## Controls

- Use `keydown` and `keyup` events.
- Track currently pressed arrow keys.
- Single directions require one matching key.
- Diagonal directions require both matching keys to be pressed at the same time.
- The game should only accept input while actively playing.
- Avoid counting the same answer multiple times while the player holds down keys.
- Clear or reset pressed keys after each answered challenge.

## Scoring

- Correct answer: +1 point
- Incorrect answer: +0 points
- Correct answer increases streak by 1
- Incorrect answer resets streak to 0

Optional scoring enhancement:

- Award a small bonus for every 5 correct answers in a row.

## Timer

- Include a 60-second countdown timer.
- The timer starts when the player clicks **Start Game**.
- When the timer reaches 0:
  - Stop accepting keyboard input.
  - Show a game-over state.
  - Display the final score.
  - Show a **Restart** button.

## User Interface Requirements

The UI should include:

- Game title: **Captain's Compass**
- Score
- Timer
- Streak counter
- Pip the parrot
- Pip's speech bubble with the current navigation order
- Large direction text
- Large direction arrow or compass indicator
- Ship on ocean waves
- Start button
- Restart button
- Correct and incorrect feedback states
- Final score screen

## Visual Design

Style direction:

- Bright, friendly, and kid-focused
- Ocean blues, sunny highlights, and warm accent colors
- Nautical details such as waves, compass, rope, sail, or wooden ship textures
- Large readable text
- Clear spacing
- Simple controls
- Playful but not cluttered

Feedback styling:

- Correct feedback should feel rewarding and upbeat
- Incorrect feedback should be gentle and encouraging
- Use animation or color changes to make feedback clear

## Animation Requirements

Recommended animations:

- Ship glides or tilts toward the correct direction
- Ship wobbles on incorrect input
- Pip bounces or reacts when giving feedback
- Direction arrow pulses when a new challenge appears
- Ocean waves move subtly in the background

Animations should be simple and should not make the game hard to read.

## Accessibility Requirements

- Use large, high-contrast text
- Do not rely only on color to show correct or incorrect feedback
- Keep keyboard focus behavior predictable
- Buttons should be reachable and usable with keyboard navigation
- Feedback text should be visible on screen

## React Implementation Requirements

Use React functional components and hooks.

Recommended state:

- `gameState`: idle, playing, finished
- `score`
- `streak`
- `timeLeft`
- `currentChallenge`
- `pressedKeys`
- `feedback`
- `lastAnswerState`: correct, incorrect, or neutral

Recommended effects:

- Timer countdown effect while the game is playing
- Keyboard listener effect for `keydown` and `keyup`
- Challenge generation after each answered prompt

Recommended components:

- `App`
- `GameHeader`
- `PipPrompt`
- `ShipScene`
- `CompassDisplay`
- `Controls`
- `GameOver`

## Success Criteria

The game is complete when:

- The player can start the game.
- Pip gives random direction orders.
- The player can answer with arrow keys.
- All 8 directions are supported.
- Diagonal directions require two arrow keys together.
- Correct answers increase score.
- Incorrect answers show feedback without increasing score.
- The timer ends the game after 60 seconds.
- The final score is shown.
- The player can restart the game.
- The visual theme clearly feels like a ship navigation game guided by Pip the parrot.

