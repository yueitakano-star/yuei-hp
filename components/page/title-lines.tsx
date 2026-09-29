import { Fragment } from "react";

/**
 * A big title as unbreakable units (see titleParts): each part is an
 * inline-block, so lines break only between parts. Pair with `break-keep`
 * on the heading so a part never breaks mid-word (Safari lacks
 * `word-break: auto-phrase`). A part ending in a space (e.g.
 * 「オ酒ト定食ノ店 |暖家」) keeps that space as a gap between the parts;
 * inside the inline-block it would collapse away.
 */
export function TitleLines({ parts }: { parts: readonly string[] }) {
  return parts.map((part, i) => {
    const text = part.trimEnd();
    return (
      <Fragment key={i}>
        <span className="inline-block">{text}</span>
        {text !== part && " "}
      </Fragment>
    );
  });
}
