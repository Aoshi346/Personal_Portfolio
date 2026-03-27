import gsap from "gsap";

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const scrambleText = (element: HTMLElement, duration = 0.62) => {
  const finalText = element.dataset.finalText ?? element.textContent ?? "";
  element.dataset.finalText = finalText;

  const state = { progress: 0 };
  gsap.to(state, {
    progress: 1,
    duration,
    ease: "power2.out",
    onUpdate: () => {
      const revealCount = Math.floor(finalText.length * state.progress);
      let output = "";

      for (let i = 0; i < finalText.length; i++) {
        const ch = finalText[i];
        const isFixed = ch === " " || ch === "-" || ch === "_";

        if (isFixed || i < revealCount) {
          output += ch;
        } else {
          output += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
      }

      element.textContent = output;
    },
    onComplete: () => {
      element.textContent = finalText;
    },
  });
};
