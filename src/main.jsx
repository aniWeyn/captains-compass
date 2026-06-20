import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const GAME_SECONDS = 60;
const ARROW_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

const CHALLENGES = [
  {
    label: "Nord",
    display: "Opp",
    symbol: "N",
    pointClass: "n",
    requiredKeys: ["ArrowUp"],
    prompts: ["Kaptein, seil nordover!", "Løft baugen mot nord!", "Styr opp!"],
    vector: { x: 0, y: -1 },
    rotation: 0,
  },
  {
    label: "Sør",
    display: "Ned",
    symbol: "S",
    pointClass: "s",
    requiredKeys: ["ArrowDown"],
    prompts: ["Styr sørover!", "Seil nedover kartet!", "Ta oss mot sør!"],
    vector: { x: 0, y: 1 },
    rotation: 180,
  },
  {
    label: "Vest",
    display: "Venstre",
    symbol: "V",
    pointClass: "w",
    requiredKeys: ["ArrowLeft"],
    prompts: ["Sett kurs vestover!", "Hardt mot babord!", "Styr til venstre!"],
    vector: { x: -1, y: 0 },
    rotation: -90,
  },
  {
    label: "Øst",
    display: "Høyre",
    symbol: "Ø",
    pointClass: "e",
    requiredKeys: ["ArrowRight"],
    prompts: ["Sving østover!", "Hardt mot styrbord!", "Styr til høyre!"],
    vector: { x: 1, y: 0 },
    rotation: 90,
  },
  {
    label: "Nordøst",
    display: "Opp + Høyre",
    symbol: "NØ",
    pointClass: "ne",
    requiredKeys: ["ArrowUp", "ArrowRight"],
    prompts: ["Sving nordøst!", "Fang nordøstvinden!", "Opp og høyre, kaptein!"],
    vector: { x: 1, y: -1 },
    rotation: 45,
  },
  {
    label: "Nordvest",
    display: "Opp + Venstre",
    symbol: "NV",
    pointClass: "nw",
    requiredKeys: ["ArrowUp", "ArrowLeft"],
    prompts: ["Sett kurs nordvest!", "Opp og venstre, kaptein!", "Ta oss mot nordvest!"],
    vector: { x: -1, y: -1 },
    rotation: -45,
  },
  {
    label: "Sørøst",
    display: "Ned + Høyre",
    symbol: "SØ",
    pointClass: "se",
    requiredKeys: ["ArrowDown", "ArrowRight"],
    prompts: ["Seil sørøst!", "Ned og høyre, kaptein!", "Sett kurs sørøst!"],
    vector: { x: 1, y: 1 },
    rotation: 135,
  },
  {
    label: "Sørvest",
    display: "Ned + Venstre",
    symbol: "SV",
    pointClass: "sw",
    requiredKeys: ["ArrowDown", "ArrowLeft"],
    prompts: ["Sving sørvest!", "Ned og venstre, kaptein!", "Sett kurs sørvest!"],
    vector: { x: -1, y: 1 },
    rotation: -135,
  },
];

const CORRECT_FEEDBACK = [
  "Riktig! Vi seiler rett vei!",
  "Flott styring! Skipet følger kursen!",
  "Ja vel, kaptein! Det var riktig retning!",
  "Perfekt! Kompasset og skipet er enige!",
];

const WRONG_FEEDBACK = [
  "Å nei, vi styrer feil vei!",
  "Oops! Skipet kom ut av kurs!",
  "Nesten, kaptein, men det var feil retning!",
  "Sjekk kompasset! Vi må styre en annen vei!",
];

const KEY_LABELS = {
  ArrowUp: "Opp",
  ArrowDown: "Ned",
  ArrowLeft: "Venstre",
  ArrowRight: "Høyre",
};

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
  const [feedback, setFeedback] = useState("Pip er klar med første kurs.");
  const [lastAnswerState, setLastAnswerState] = useState("neutral");
  const [shipMotion, setShipMotion] = useState({ x: 0, y: 0, rotation: 0 });
  const [answeredToken, setAnsweredToken] = useState(0);
  const launchTimerRef = useRef();
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
      }, 1500);
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
    window.clearTimeout(launchTimerRef.current);
    setGameState("launching");
    setScore(0);
    setStreak(0);
    setTimeLeft(GAME_SECONDS);
    setFeedback("Pip tar med startknappen tilbake til masten!");
    setLastAnswerState("neutral");
    setShipMotion({ x: 0, y: 0, rotation: 0 });
    setCurrentChallenge(getRandomChallenge());
    resetRoundInput();

    launchTimerRef.current = window.setTimeout(() => {
      setGameState("playing");
      setFeedback("Følg kursen fra Pip!");
    }, 880);
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
          setFeedback("Tiden er ute, kaptein!");
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
    return () => window.clearTimeout(launchTimerRef.current);
  }, []);

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
      <GameHeader
        score={score}
        streak={streak}
        timeLeft={timeLeft}
        gameState={gameState}
        onStart={startGame}
        onRestart={restartGame}
        finalScore={score}
      />

      <section className="game-shell" aria-label="Kapteinens Kompass-spill">
        <ShipScene
          challenge={currentChallenge}
          motion={shipMotion}
          lastAnswerState={lastAnswerState}
          gameState={gameState}
          pressedKeys={pressedKeys}
          answeredToken={answeredToken}
          onStart={startGame}
        />
      </section>
    </main>
  );
}

function GameHeader({ score, streak, timeLeft, gameState, onStart, onRestart, finalScore }) {
  return (
    <header className="game-header">
      <div>
        <p className="eyebrow">Pips navigasjonsskole</p>
        <h1>Kapteinens Kompass</h1>
      </div>
      <div className="stats" aria-label="Spillstatistikk">
        <Stat label="Poeng" value={score} />
        <Stat label="Rekke" value={streak} />
        <Stat label="Tid" value={`${timeLeft}s`} />
      </div>
      <Controls gameState={gameState} onStart={onStart} onRestart={onRestart} score={finalScore} />
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

function CompassPip({ gameState, lastAnswerState, onStart }) {
  const isStartMoment = gameState === "idle" || gameState === "launching";

  return (
    <div className={`pip-perch pip-perch-${gameState}`}>
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
      {isStartMoment ? (
        <div className="start-bubble">
          <p className="start-title">Hei, kaptein!</p>
          <p className="start-copy">
            Jeg er Pip. Kompasset viser kursen, og du styrer skipet med piltastene.
            Noen ganger trenger vi to piler samtidig!
          </p>
          <button
            className="pip-start-button"
            type="button"
            onClick={onStart}
            disabled={gameState === "launching"}
          >
            {gameState === "launching" ? "Starter..." : "Start spillet"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function CompassDisplay({ challenge, pressedKeys, gameState, answeredToken, lastAnswerState, onStart }) {
  return (
    <section className="compass-panel" aria-label="Nåværende retningsoppgave">
      <div className="compass-wrap">
        <CompassPip gameState={gameState} lastAnswerState={lastAnswerState} onStart={onStart} />
        <div className="compass">
          {CHALLENGES.map((item) => (
            <span
              key={item.label}
              className={`compass-point point-${item.pointClass} ${
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
      </div>
      <div className="direction-card">
        <span className="direction-label">Kompasskurs</span>
        <strong>{gameState === "playing" ? challenge.display : "Trykk Start"}</strong>
        <span>{gameState === "playing" ? challenge.label : "Start reisen"}</span>
      </div>
      <div className="key-row" aria-label="Trykkede piltaster">
        {ARROW_KEYS.map((key) => (
          <kbd key={key} className={pressedKeys.includes(key) ? "pressed" : ""}>
            {KEY_LABELS[key]}
          </kbd>
        ))}
      </div>
    </section>
  );
}

function ShipScene({
  challenge,
  motion,
  lastAnswerState,
  gameState,
  pressedKeys,
  answeredToken,
  onStart,
}) {
  const shipStyle = {
    "--ship-x": `${motion.x * 18}px`,
    "--ship-y": `${motion.y * 14}px`,
    "--ship-rotation": `${motion.rotation}deg`,
  };

  return (
    <section className="sea-scene" aria-label="Scene der skipet styres">
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
        <p className="ship-heading">{gameState === "playing" ? challenge.label : "Til ankers"}</p>
      </div>
      <CompassDisplay
        challenge={challenge}
        pressedKeys={pressedKeys}
        gameState={gameState}
        answeredToken={answeredToken}
        lastAnswerState={lastAnswerState}
        onStart={onStart}
      />
      <div className="wave wave-one" />
      <div className="wave wave-two" />
      <div className="wave wave-three" />
    </section>
  );
}

function Controls({ gameState, onStart, onRestart, score }) {
  if (gameState === "idle" || gameState === "launching") {
    return null;
  }

  if (gameState === "finished") {
    return (
      <section className="controls game-over" aria-live="polite">
        <div>
          <span className="direction-label">Sluttpoeng</span>
          <strong>{score}</strong>
        </div>
        <button type="button" onClick={onRestart}>
          Start reisen på nytt
        </button>
      </section>
    );
  }

  return (
    <section className="controls">
      {gameState === "idle" ? (
        <button type="button" onClick={onStart}>
          Start spillet
        </button>
      ) : (
        <button type="button" onClick={onRestart}>
          Start på nytt
        </button>
      )}
    </section>
  );
}

createRoot(document.getElementById("root")).render(<App />);
