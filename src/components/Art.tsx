import React from "react";
const paths: Record<string, string> = {
  game: "M3 8h18v10h-4l-3-3h-4l-3 3H3z M7 10v4m-2-2h4m7-1h1m1 2h1",
  sun: "M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2 M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  moon: "M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11z",
  deck: "M4 6h7l1 2 1-2h7v13h-7l-1 1-1-1H4z M12 9v10",
  upload: "M12 16V4m-5 5 5-5 5 5M4 15v5h16v-5",
  file: "M6 3h8l4 4v14H6z M14 3v5h4 M9 12h6m-6 4h6",
  text: "M4 6h16M4 11h16M4 16h10",
  sliders: "M4 7h4m4 0h8M4 17h9m4 0h3 M8 4h4v6H8z M13 14h4v6h-4z",
  play: "M7 4l13 8-13 8z",
  bolt: "M13 2L4 14h7l-1 8L21 9h-8z",
  heart: "M3 5h6l3 3 3-3h6v8l-9 8-9-8z",
  arrow: "M4 12h15m-6-6 6 6-6 6",
};
export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
export function Pad() {
  return (
    <svg viewBox="0 0 44 32" width="39" aria-hidden="true">
      <path
        fill="currentColor"
        d="M8 3h28v4h4v6h3v15h-4v3h-7v-4h-4v-4H16v4h-4v4H5v-3H1V13h3V7h4z"
      />
      <path
        fill="#24252d"
        d="M10 9h4v4h4v4h-4v4h-4v-4H6v-4h4zm20 7h4v4h-4zm5-7h4v4h-4z"
      />
    </svg>
  );
}
export function ArcadeArt() {
  return (
    <svg className="heroart" viewBox="0 0 440 190" aria-hidden="true">
      <defs>
        <pattern id="dots" width="13" height="13" patternUnits="userSpaceOnUse">
          <rect width="2" height="2" fill="#727382" opacity=".52" />
        </pattern>
      </defs>
      <rect width="440" height="190" fill="url(#dots)" />
      <g fill="#ffe157">
        <path d="M48 106h4v7h7v4h-7v7h-4v-7h-7v-4h7zM347 21h4v5h5v4h-5v5h-4v-5h-5v-4h5z" />
        <path d="M312 122l8-10 6 4-8 10 8 4-23 16 9-16-8-3z" />
      </g>
      <g stroke="#c198ff" strokeWidth="3" fill="none">
        <path d="M88 33l11-6 11 6-11 7z M88 33v12l11 7 11-7V33m-11 7v12" />
        <path d="M365 97l14-8 15 8-15 9zM365 97v17l14 9 15-9V97m-15 9v17" />
      </g>
      <g
        transform="translate(133 7) rotate(12 70 80)"
        stroke="#171821"
        strokeWidth="4"
        strokeLinejoin="round"
      >
        <path d="M9 9h128v137l-20 24H16l-9-9z" fill="#8467bd" />
        <path d="M3 2h126v137l-20 24H9l-7-7z" fill="#b99ae3" />
        <path d="M15 16h101v64l-10 11H15z" fill="#393747" />
        <path d="M24 23h82v54H24z" fill="#b6c994" />
        <g fill="#4c6352" stroke="none">
          <path d="M40 44h9v-7h28v7h9v19h-8v6h-8v-8H54v8h-8v-6h-6z" />
          <path fill="#dbe7ac" d="M49 46h7v8h-7zm22 0h7v8h-7z" />
        </g>
        <path d="M26 101h11v10h11v11H37v11H26v-11H15v-11h11z" fill="#343641" />
        <circle cx="86" cy="116" r="8" fill="#ffad80" />
        <circle cx="106" cy="103" r="8" fill="#ffdc60" />
        <path d="M53 146l11-5m4 5 11-5m13-1 6-9m1 12 7-11" strokeWidth="3" />
      </g>
      <path
        d="M112 113l-17 4m18 5-10 4M281 42l13-7"
        stroke="#89849c"
        strokeWidth="3"
      />
    </svg>
  );
}
export function GameArt({ name }: { name: string }) {
  if (name === "Hangman") return <svg width="65" height="44" viewBox="0 0 74 50" aria-hidden="true" stroke="currentColor" strokeWidth="3" fill="none">
    <path d="M9 44h28M19 44V5h28v7M19 17l12-12"/><circle cx="47" cy="17" r="5" fill="#ffda53"/>
    <path d="M47 22v11m0-9-7 6m7-6 7 6m-7 3-6 9m6-9 6 9"/></svg>;
  const cells =
    name === "Tetris"
      ? [
          [2, 0, 1],
          [2, 1, 1],
          [2, 2, 1],
          [3, 2, 1],
          [0, 2, 2],
          [1, 2, 2],
          [0, 3, 2],
          [1, 3, 2],
          [3, 3, 3],
          [4, 3, 3],
          [5, 3, 3],
          [4, 2, 3],
        ]
      : [
          [0, 3, 2],
          [1, 3, 2],
          [2, 3, 2],
          [2, 2, 2],
          [2, 1, 2],
          [3, 1, 2],
          [4, 1, 2],
          [5, 2, 3],
        ];
  return (
    <svg width="65" height="44" viewBox="0 0 74 50" aria-hidden="true">
      {name === "2048" ? (
        <g transform="rotate(-6 34 25)">
          {[
            [4, 17, "2", "#f8ecc9"],
            [24, 5, "4", "#ffd35d"],
            [44, 17, "8", "#ff9c5e"],
          ].map(([x, y, n, c]) => (
            <g key={n}>
              <rect
                x={x}
                y={y}
                width="25"
                height="26"
                rx="3"
                stroke="#362f28"
                strokeWidth="2"
                fill={String(c)}
              />
              <text
                x={Number(x) + 12}
                y={Number(y) + 19}
                textAnchor="middle"
                fontWeight="900"
                fontFamily="monospace"
                fontSize="19"
                fill="#292825"
              >
                {n}
              </text>
            </g>
          ))}
        </g>
      ) : (
        cells.map(([x, y, v]) => (
          <rect
            key={x + "," + y}
            x={6 + x * 10}
            y={3 + y * 10}
            width="10"
            height="10"
            stroke="#33323b"
            strokeWidth="1.5"
            fill={["", "#af88de", "#91c7ad", "#f7c254"][v]}
          />
        ))
      )}
    </svg>
  );
}
