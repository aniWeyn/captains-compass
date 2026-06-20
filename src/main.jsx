import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const GAME_SECONDS = 60;
const ARROW_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

const CHALLENGES = [
  {
    label: "North",
    display: "Up",
    symbol: "N",
    requiredKeys: ["ArrowUp"],
    prompts: ["Captain, sail north!", "Raise the bow north!", "Steer up!"],
    vector: { x: 0, y: -1 },
    rotation: 0,
  },
  {
    label: "South",
    display: "Down",
    symbol: "S",
    requiredKeys: ["ArrowDown"],
    prompts: ["Steer south!", "Sail down the map!", "Bring us south!"],
    vector: { x: 0, y: 1 },
    rotation: 180,
  },
  {
    label: "West",
    display: "Left",
    symbol: "W",
    requiredKeys: ["ArrowLeft"],
    prompts: ["Head west!", "Hard to port!", "Steer left!"],
    vector: { x: -1, y: 0 },
    rotation: -90,
  },
  {
    label: "East",
    display: "Right",
    symbol: "E",
    requiredKeys: ["ArrowRight"],
    prompts: ["Turn east!", "Hard to starboard!", "Steer right!"],
    vector: { x: 1, y: 0 },
    rotation: 90,
  },
  {
    label: "Northeast",
    display: "Up + Right",
    symbol: "NE",
    requiredKeys: ["ArrowUp", "ArrowRight"],
    prompts: ["Turn northeast!", "Catch the northeast wind!", "Up and right, Captain!"],
    vector: { x: 1, y: -1 },
    rotation: 45,
  },
  {
    label: "Northwest",
    display: "Up + Left",
    symbol: "NW",
    requiredKeys: ["ArrowUp", "ArrowLeft"],
    prompts: ["Head northwest!", "Up and left, Captain!", "Take us northwest!"],
    vector: { x: -1, y: -1 },
    rotation: -45,
  },
  {
    label: "Southeast",
    display: "Down + Right",
    symbol: "SE",
    requiredKeys: ["ArrowDown", "ArrowRight"],
    prompts: ["Sail southeast!", "Down and right, Captain!", "Set course southeast!"],
    vector: { x: 1, y: 1 },
    rotation: 135,
  },
  {
    label: "Southwest",
    display: "Down + Left",
    symbol: "SW",
    requiredKeys: ["ArrowDown", "ArrowLeft"],
    prompts: ["Swing southwest!", "Down and left, Captain!", "Set course southwest!"],
    vector: { x: -1, y: 1 },
    rotation: -135,
  },
];

const CORRECT_FEEDBACK = [
  "Aye aye, perfect!",
  "Smooth sailing!",
  "Great steering, Captain!",
  "That is the right heading!",
];

const WRONG_FEEDBACK = [
  "Oops, check the compass!",
  "Try that heading again!",
  "Almost, Captain!",
  "Let's steer the other way!",
];

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function getRandomChallenge(previousLabel) {
  const options = CHALLENGES.filter((challenge) => challenge.label !== previousLabel);
  return randomItem(options.length ? options : CHALLENGES);
}

function sameKeys(pressedKeys, requiredKeys) {
  return pressedKeys.length === requiredKeys.length && requiredKeys.every((key) => pressedKeys.includes(key));
}

function isSubsetOfRequired(pressedKeys, requiredKeys) {
  return pressedKeys.every((key) => requiredKeys.includes(key));
}

function App() {
  const [gameState, setGameState] = useState("idle");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [currentChallenge, setCurrentChallenge] = useState(() => getRandomChallenge());
  const [pressedKeys, setPressedKeys] = useState([]);
  const [feedback, setFeedback] = useState("Pip is ready with your first heading.");
  const [lastAnswerState, setLastAnswerState] = useState("neutral");
  const [shipMotion, setShipMotion] = useState({ x: 0, y: 0, rotation: 0 });
  const [answeredToken, setAnsweredToken] = useState(0);
  const lockedRef = useRef(false);

  const currentPrompt = useMemo(() => randomItem(currentChallenge.prompts), [currentChallenge]);

  const nextChallenge = useCallback(() => {
    setCurrentChallenge((challenge) => getRandomChallenge(challenge.label));
  }, []);

  const resetRoundInput = useCallback(() => {
    setPressedKeys([]);
    lockedRef.current = false;
  }, []);

  const answerChallenge = useCallback(
    (isCorrect) => {
      if (lockedRef.current || gameState !== "playing") {
        return;
      }

      lockedRef.current = true;
      setAnsweredToken((token) => token + 1);
      setLastAnswerState(isCorrect ? "correct" : "incorrect");
      setFeedback(randomItem(isCorrect ? CORRECT_FEEDBACK : WRONG_FEEDBACK));

      if (isCorrect) {
        setScore((value) => value + 1);
        setStreak((value) => value + 1);
        setShipMotion({
          x: currentChallenge.vector.x,
          y: currentChallenge.vector.y,
          rotation: currentChallenge.rotation,
        });
      } else {
        setStreak(0);
      }

      window.setTimeout(() => {
        nextChallenge();
        resetRoundInput();
        setLastAnswerState("neutral");
      }, 700);
    },
    [currentChallenge, gameState, nextChallenge, resetRoundInput],
  );

  const evaluateKeys = useCallback(
    (keys) => {
      if (lockedRef.current || gameState !== "playing" || keys.length === 0) {
        return;
      }

      const requiredKeys = currentChallenge.requiredKeys;

      if (sameKeys(keys, requiredKeys)) {
        answerChallenge(true);
        return;
      }

      if (!isSubsetOfRequired(keys, requiredKeys) || keys.length >= requiredKeys.length) {
        answerChallenge(false);
      }
    },
    [answerChallenge, currentChallenge, gameState],
  );

  const startGame = useCallback(() => {
    setGameState("playing");
    setScore(0);
    setStreak(0);
    setTimeLeft(GAME_SECONDS);
    setFeedback("Follow Pip's heading!");
    setLastAnswerState("neutral");
    setShipMotion({ x: 0, y: 0, rotation: 0 });
    setCurrentChallenge(getRandomChallenge());
    resetRoundInput();
  }, [resetRoundInput]);

  const restartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  useEffect(() => {
    if (gameState !== "playing") {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setTimeLeft((value) => {
        if (value <= 1) {
          window.clearInterval(timerId);
          setGameState("finished");
          setFeedback("Time is up, Captain!");
          setLastAnswerState("neutral");
          resetRoundInput();
          return 0;
        }

        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [gameState, resetRoundInput]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (!ARROW_KEYS.includes(event.key)) {
        return;
      }

      event.preventDefault();
      if (gameState !== "playing" || lockedRef.current) {
        return;
      }

      setPressedKeys((keys) => {
        const nextKeys = keys.includes(event.key) ? keys : [...keys, event.key];
        evaluateKeys(nextKeys);
        return nextKeys;
      });
    }

    function handleKeyUp(event) {
      if (!ARROW_KEYS.includes(event.key)) {
        return;
      }

      event.preventDefault();
      setPressedKeys((keys) => keys.filter((key) => key !== event.key));
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [evaluateKeys, gameState]);

  return (
    <main className={`app app-${gameState}`}>
      <GameHeader score={score} streak={streak} timeLeft={timeLeft} />

      <section className="game-shell" aria-label="Captain's Compass game">
        <div className="prompt-column">
          <PipPrompt
            gameState={gameState}
            prompt={gameState === "playing" ? currentPrompt : "Ready to steer, Captain?"}
            feedback={feedback}
            lastAnswerState={lastAnswerState}
          />
          <CompassDisplay
            challenge={currentChallenge}
            pressedKeys={pressedKeys}
            gameState={gameState}
            answeredToken={answeredToken}
          />
        </div>

        <ShipScene
          challenge={currentChallenge}
          motion={shipMotion}
          lastAnswerState={lastAnswerState}
          gameState={gameState}
        />

        <Controls gameState={gameState} onStart={startGame} onRestart={restartGame} score={score} />
      </section>
    </main>
  );
}

function GameHeader({ score, streak, timeLeft }) {
  return (
    <header className="game-header">
      <div>
        <p className="eyebrow">Pip's navigation school</p>
        <h1>Captain's Compass</h1>
      </div>
      <div className="stats" aria-label="Game stats">
        <Stat label="Score" value={score} />
        <Stat label="Streak" value={streak} />
        <Stat label="Time" value={`${timeLeft}s`} />
      </div>
    </header>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function PipPrompt({ gameState, prompt, feedback, lastAnswerState }) {
  return (
    <section className="pip-area" aria-live="polite">
      <div className={`pip pip-${lastAnswerState}`} aria-hidden="true">
        <div className="pip-feather" />
        <div className="pip-body">
          <div className="pip-face">
            <span className="pip-eye" />
            <span className="pip-beak" />
          </div>
          <div className="pip-wing" />
        </div>
        <div className="pip-claws" />
      </div>
      <div className="speech-bubble">
        <p className="prompt-text">{gameState === "finished" ? "Voyage complete!" : prompt}</p>
        <p className={`feedback feedback-${lastAnswerState}`}>{feedback}</p>
      </div>
    </section>
  );
}

function CompassDisplay({ challenge, pressedKeys, gameState, answeredToken }) {
  return (
    <section className="compass-panel" aria-label="Current direction challenge">
      <div className="compass">
        {CHALLENGES.map((item) => (
          <span
            key={item.label}
            className={`compass-point point-${item.symbol.toLowerCase()} ${
              item.label === challenge.label ? "active" : ""
            }`}
          >
            {item.symbol}
          </span>
        ))}
        <div
          key={answeredToken}
          className="compass-needle"
          style={{ transform: `translate(-50%, -82%) rotate(${challenge.rotation}deg)` }}
        />
        <div className="compass-center" />
      </div>
      <div className="direction-card">
        <span className="direction-label">Pip says</span>
        <strong>{gameState === "playing" ? challenge.display : "Press Start"}</strong>
        <span>{gameState === "playing" ? challenge.label : "Begin the voyage"}</span>
      </div>
      <div className="key-row" aria-label="Pressed arrow keys">
        {ARROW_KEYS.map((key) => (
          <kbd key={key} className={pressedKeys.includes(key) ? "pressed" : ""}>
            {key.replace("Arrow", "")}
          </kbd>
        ))}
      </div>
    </section>
  );
}

function ShipScene({ challenge, motion, lastAnswerState, gameState }) {
  const shipStyle = {
    "--ship-x": `${motion.x * 18}px`,
    "--ship-y": `${motion.y * 14}px`,
    "--ship-rotation": `${motion.rotation}deg`,
  };

  return (
    <section className="sea-scene" aria-label="Ship steering scene">
      <div className="sun" />
      <div className="cloud cloud-one" />
      <div className="cloud cloud-two" />
      <div className={`ship-wrap ship-${lastAnswerState} ship-${gameState}`} style={shipStyle}>
        <div className="ship" aria-hidden="true">
          <div className="mast" />
          <div className="sail sail-left" />
          <div className="sail sail-right" />
          <div className="flag" />
          <div className="hull" />
          <div className="porthole one" />
          <div className="porthole two" />
        </div>
        <p className="ship-heading">{gameState === "playing" ? challenge.label : "At anchor"}</p>
      </div>
      <div className="wave wave-one" />
      <div className="wave wave-two" />
      <div className="wave wave-three" />
    </section>
  );
}

function Controls({ gameState, onStart, onRestart, score }) {
  if (gameState === "finished") {
    return (
      <section className="controls game-over" aria-live="polite">
        <div>
          <span className="direction-label">Final score</span>
          <strong>{score}</strong>
        </div>
        <button type="button" onClick={onRestart}>
          Restart Voyage
        </button>
      </section>
    );
  }

  return (
    <section className="controls">
      {gameState === "idle" ? (
        <button type="button" onClick={onStart}>
          Start Game
        </button>
      ) : (
        <button type="button" onClick={onRestart}>
          Restart
        </button>
      )}
    </section>
  );
}

createRoot(document.getElementById("root")).render(<App />);
