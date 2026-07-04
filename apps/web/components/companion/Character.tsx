"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { CharacterParts } from "@/lib/companion/types";
import type { CharacterState } from "./CharacterContext";

type CharacterProps = {
  parts: CharacterParts;
  state: CharacterState;
};

const layerOrder: Array<keyof CharacterParts> = [
  "clothing",
  "hair",
  "eyes",
  "mouth",
  "accessory",
];

const zIndexByLayer: Record<keyof CharacterParts, string> = {
  clothing: "z-20",
  hair: "z-30",
  eyes: "z-40",
  mouth: "z-50",
  accessory: "z-60",
};

export function Character({ parts, state }: CharacterProps) {
  const reduceMotion = useReducedMotion();

  const containerAnimation = reduceMotion
    ? {}
    : state === "thinking"
      ? { rotate: [-1.2, 1.2, -1.2] }
      : { scale: [1, 1.02, 1] };

  return (
    <motion.div
      className="relative h-56 w-56 sm:h-72 sm:w-72"
      animate={containerAnimation}
      transition={
        reduceMotion
          ? undefined
          : {
              duration: state === "thinking" ? 0.8 : 2,
              repeat: Infinity,
              ease: "easeInOut",
            }
      }
      aria-label="Mascota del compañero"
      role="img"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- capas locales superpuestas en /public/parts */}
      <img
        src="/parts/body.png"
        alt=""
        className="absolute inset-0 z-10 h-full w-full object-contain"
        draggable={false}
      />
      {layerOrder.map((layer) => {
        const part = parts[layer];
        if (!part) {
          return null;
        }

        const image = (
          // eslint-disable-next-line @next/next/no-img-element -- capas locales superpuestas en /public/parts
          <img
            src={part.imageUrl}
            alt=""
            className={`absolute inset-0 h-full w-full object-contain ${zIndexByLayer[layer]}`}
            draggable={false}
          />
        );

        if (layer !== "mouth" || state !== "talking" || reduceMotion) {
          return <span key={layer}>{image}</span>;
        }

        return (
          <motion.span
            key={layer}
            className="absolute inset-0 z-50"
            animate={{ scaleY: [0.92, 1.08, 0.96] }}
            transition={{ duration: 0.3, repeat: Infinity, ease: "easeInOut" }}
          >
            {image}
          </motion.span>
        );
      })}
    </motion.div>
  );
}
