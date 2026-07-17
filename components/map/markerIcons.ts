import L from "leaflet";

const BASE_STYLE =
  "display:flex;align-items:center;justify-content:center;font-family:-apple-system,'Helvetica Neue',Arial,sans-serif;font-weight:700;color:#fff;border:2px solid #21262C;box-shadow:0 1px 3px rgba(0,0,0,.4);";

// Visited stops keep their number/star but drop to a neutral gray, so the
// remaining (unvisited) stops stay the ones that pop off the map.
const VISITED_GRAY = "#B9BFC7";

/** Numbered "subway bullet" marker for a stop in the day's route. */
export function bulletIcon(number: number, color: string, visited?: boolean): L.DivIcon {
  const bg = visited ? VISITED_GRAY : color;
  return L.divIcon({
    className: "",
    html: `<div style="${BASE_STYLE}width:32px;height:32px;border-radius:9999px;background:${bg};font-size:15px;">${number}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

/** Gold star marker for the day's fixed sunset spot. */
export function sunsetIcon(visited?: boolean): L.DivIcon {
  const bg = visited ? VISITED_GRAY : "#E89B31";
  const sunSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
  return L.divIcon({
    className: "",
    html: `<div style="${BASE_STYLE}width:36px;height:36px;border-radius:9999px;background:${bg};color:#21262C;">${sunSvg}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

/** Black diamond marker for the home base (Jersey City). */
export function homeIcon(): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="width:20px;height:20px;background:#21262C;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.5);transform:rotate(45deg);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

/** Small "WC" bullet used for restroom pins. */
export function restroomIcon(source: "official" | "custom"): L.DivIcon {
  const bg = source === "official" ? "#0039A6" : "#21262C";
  return L.divIcon({
    className: "",
    html: `<div style="${BASE_STYLE}width:26px;height:26px;border-radius:9999px;background:${bg};font-size:9px;letter-spacing:.5px;">WC</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13],
  });
}

/** Marker shown for a point the user just picked by tapping the map. */
export function pickedPointIcon(): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="width:22px;height:22px;border-radius:9999px;background:#fff;border:3px solid #D9553D;box-shadow:0 1px 3px rgba(0,0,0,.5);"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}
