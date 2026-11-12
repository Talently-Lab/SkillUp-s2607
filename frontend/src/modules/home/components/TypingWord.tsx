import { useEffect, useState } from "react";

type TypingWordProps = { words: string[] };

/**
 * Rotates through `words` with a typing effect. The search box never writes
 * here (a long query would break the headline).
 */
export function TypingWord({ words }: TypingWordProps) {
  const [text, setText] = useState(words[0]);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let index = 0;
    let current = words[0];
    let timer = 0;

    const typeNext = () => {
      index = (index + 1) % words.length;
      const word = words[index];
      if (reduce) {
        current = word;
        setText(word);
        timer = window.setTimeout(typeNext, 3200);
        return;
      }
      setTyping(true);
      const step = () => {
        if (!word.startsWith(current)) {
          current = current.slice(0, -1);
          setText(current || "​");
          timer = window.setTimeout(step, 45);
        } else if (current.length < word.length) {
          current = word.slice(0, current.length + 1);
          setText(current);
          timer = window.setTimeout(step, 85 + Math.random() * 60);
        } else {
          setTyping(false);
          timer = window.setTimeout(typeNext, 2400);
        }
      };
      step();
    };

    timer = window.setTimeout(typeNext, 2400);
    return () => window.clearTimeout(timer);
  }, [words]);

  return (
    <span className={typing ? "hero-slot hero-slot--typing" : "hero-slot"}>
      <span className="hero-slot__text">{text}</span>
      <span className="hero-slot__caret" />
    </span>
  );
}
