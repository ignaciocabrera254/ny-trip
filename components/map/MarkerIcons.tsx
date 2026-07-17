import React from "react";

const BASE_STYLE: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "-apple-system,'Helvetica Neue',Arial,sans-serif",
  fontWeight: 700,
  color: "#fff",
  border: "2px solid #21262C",
  boxShadow: "0 1px 3px rgba(0,0,0,.4)",
};

const VISITED_GRAY = "#B9BFC7";

/** Numbered "subway bullet" marker for a stop in the day's route. */
export function BulletIcon({ number, color, visited }: { number: number; color: string; visited?: boolean }) {
  const bg = visited ? VISITED_GRAY : color;
  return (
    <div
      style={{
        ...BASE_STYLE,
        width: 32,
        height: 32,
        borderRadius: 9999,
        background: bg,
        fontSize: 15,
      }}
    >
      {number}
    </div>
  );
}

/** Gold star marker for the day's fixed sunset spot. */
export function SunsetIcon({ visited }: { visited?: boolean }) {
  const bg = visited ? VISITED_GRAY : "var(--sunset-marker)";
  return (
    <div
      style={{
        ...BASE_STYLE,
        width: 36,
        height: 36,
        borderRadius: 9999,
        background: bg,
        color: "#21262C",
        fontSize: 18,
      }}
    >
      &#9733;
    </div>
  );
}

/** Black diamond marker for the home base (Jersey City). */
export function HomeIcon() {
  return (
    <div
      style={{
        width: 20,
        height: 20,
        background: "#21262C",
        border: "2px solid #fff",
        boxShadow: "0 1px 3px rgba(0,0,0,.5)",
        transform: "rotate(45deg)",
      }}
    />
  );
}

/** Small "WC" bullet used for restroom pins. Teal on purpose — keeps it out of
 *  the amber the sunset/route markers use, so the two don't compete. */
export function RestroomIcon() {
  const bg = "var(--restroom-pin)";
  return (
    <div
      style={{
        ...BASE_STYLE,
        width: 26,
        height: 26,
        borderRadius: 9999,
        background: bg,
        fontSize: 9,
        letterSpacing: 0.5,
      }}
    >
      WC
    </div>
  );
}

/** Marker shown for a point the user just picked by tapping the map. */
export function PickedPointIcon() {
  return (
    <div
      style={{
        width: 22,
        height: 22,
        borderRadius: 9999,
        background: "#fff",
        border: "3px solid #D9553D",
        boxShadow: "0 1px 3px rgba(0,0,0,.5)",
      }}
    />
  );
}
