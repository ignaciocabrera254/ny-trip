import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Placeholder favicon until the approved logo mark (not just the wordmark) is
// available — amber "S" on the brand's slate, matching the wordmark's colors.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#21262C",
          borderRadius: "50%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "#E89B31",
            color: "#21262C",
            fontSize: 16,
            fontWeight: 700,
            fontFamily: "-apple-system, Helvetica, Arial, sans-serif",
          }}
        >
          S
        </div>
      </div>
    ),
    { ...size }
  );
}
