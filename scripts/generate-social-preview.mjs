// Run from the repository root: node --import tsx scripts/generate-social-preview.mjs
import { readFile, writeFile } from "node:fs/promises";
import { createElement as h } from "react";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { config } from "../src/data/config.ts";

const ivory = "#FAF7F2", wine = "#5C141E", gold = "#C5A368";
const box = (style, ...children) => h("div", { style: { display: "flex", ...style } }, ...children);
const text = (content, style = {}) => box({ justifyContent: "center", ...style }, content);
const [portrait, serif, sans] = await Promise.all([
  readFile(`public${config.images.portrait}`),
  readFile("public/fonts/NotoSerif-Regular.woff"),
  readFile("public/fonts/NotoSans-Regular.woff"),
]);
const ornament = h("svg", { width: 160, height: 40, viewBox: "0 0 160 40", fill: "none" },
  h("g", { stroke: gold, strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" },
    h("path", { d: "M8 20h25c11 0 13-15 3-15-9 0-9 12-1 12M152 20h-25c-11 0-13-15-3-15 9 0 9 12 1 12" }),
    h("path", { d: "M33 20c15 0 15 16 26 12 8-3 5-13-2-10M127 20c-15 0-15 16-26 12-8-3-5-13 2-10M44 20h19l17-15 17 15H116M63 20l17 15 17-15M73 20l7-7 7 7-7 7z" }),
  ),
);
const card = box({ width: "100%", height: "100%", background: ivory, color: wine, fontFamily: "Noto Sans", position: "relative", overflow: "hidden" },
  box({ position: "absolute", inset: 22, border: `1px solid ${gold}`, opacity: 0.6 }),
  box({ position: "absolute", left: 70, top: 42, width: 430, height: 570, border: `1px solid ${gold}`, borderRadius: "230px 230px 0 0", background: "linear-gradient(135deg, #f1e5d5, #fcf9f3)" }),
  h("img", { src: `data:image/png;base64,${portrait.toString("base64")}`, width: 540, height: 720, style: { position: "absolute", left: 18, top: -20 } }),
  box({ position: "absolute", left: 560, top: 72, width: 580, alignItems: "center", flexDirection: "column" },
    text(config.event.title, { fontSize: 23, letterSpacing: 5, color: "#9C793E", marginBottom: 36 }),
    ...config.people.map(({ name, age }, index) => box({ alignItems: "baseline", justifyContent: "center", gap: 15, marginBottom: index === 0 ? 18 : 24 },
      text(name, { fontFamily: "Noto Serif", fontSize: 51 }),
      text(`${age}`, { fontFamily: "Noto Serif", fontSize: 46 }),
      text(config.event.ageLabel, { fontSize: 21 }),
    )),
    ornament,
    text(`${config.event.dateLabel} · ${config.event.startTime}`, { fontFamily: "Noto Serif", fontSize: 29, marginTop: 28 }),
    text(`${config.venue.city} · ${config.venue.name}`, { fontSize: 21, marginTop: 14, color: "#786960" }),
    box({ width: 60, height: 1, background: gold, marginTop: 28, marginBottom: 22 }),
    text("Қуанышымызға ортақ болыңыздар!", { fontFamily: "Noto Serif", fontSize: 22 }),
  ),
);
const response = new ImageResponse(card, {
  width: 1200, height: 630,
  fonts: [
    { name: "Noto Serif", data: serif, weight: 400, style: "normal" },
    { name: "Noto Sans", data: sans, weight: 400, style: "normal" },
  ],
});
const jpeg = await sharp(Buffer.from(await response.arrayBuffer())).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
await writeFile(`public${config.seo.image}`, jpeg);
console.log(`Social preview generated: 1200 × 630, ${jpeg.length} bytes`);
