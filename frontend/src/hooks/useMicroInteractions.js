// ─────────────────────────────────────────────
//  useMicroInteractions — Card hover variants
// ─────────────────────────────────────────────

export const cardHover = {
  rest: {
    scale    : 1,
    y        : 0,
    boxShadow: "0 0 0 rgba(96,165,250,0)",
  },
  hover: {
    scale    : 1.01,
    y        : -3,
    boxShadow: "0 8px 30px rgba(96,165,250,0.15)",
    transition: { duration: 0.2, ease: "easeOut" },
  },
  tap: {
    scale: 0.99,
    y    : 0,
  },
};

export const buttonHover = {
  rest : { scale: 1 },
  hover: { scale: 1.05 },
  tap  : { scale: 0.95 },
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show  : { opacity: 1, y: 0,
    transition: { duration: 0.4 } },
};