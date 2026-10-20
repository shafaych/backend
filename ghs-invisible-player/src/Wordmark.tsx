import React from "react";

/** Original geometric GHS letterforms (stroke centerlines), local coords, letter box 220 x 300 */
export const WM = {
  G: {x: -275, d: "M 98 -86 C 72 -140 -22 -150 -68 -116 C -120 -78 -120 80 -68 116 C -22 150 82 146 108 82 L 108 16", bar: "M 108 16 L 14 16"},
  H: {x: 0, d: "M -86 -150 V 150 M 86 -150 V 150", bar: "M -86 22 H 86"},
  S: {x: 275, d: "M 96 -94 C 70 -142 -84 -152 -94 -76 C -104 -4 92 -10 94 72 C 94 150 -62 152 -98 98", bar: ""},
};
export const LETTERS = (["G", "H", "S"] as const).map((k) => ({k, ...WM[k]}));
export const SW = 42;
