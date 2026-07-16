import L from "leaflet";

const BASE_STYLE =
  "display:flex;align-items:center;justify-content:center;font-family:-apple-system,'Helvetica Neue',Arial,sans-serif;font-weight:700;color:#fff;border:2px solid #0a0a0a;box-shadow:0 1px 3px rgba(0,0,0,.4);";

/** Numbered "subway bullet" marker for a stop in the day's route. */
export function bulletIcon(number: number, color: string): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="${BASE_STYLE}width:32px;height:32px;border-radius:9999px;background:${color};font-size:15px;">${number}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

/** Gold star marker for the day's fixed sunset spot. */
export function sunsetIcon(): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="${BASE_STYLE}width:36px;height:36px;border-radius:9999px;background:#FCCC0A;color:#0a0a0a;font-size:18px;">&#9733;</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

/** Black diamond marker for the home base (Jersey City). */
export function homeIcon(): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="width:20px;height:20px;background:#0a0a0a;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.5);transform:rotate(45deg);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

/** Small "WC" bullet used for restroom pins. */
export function restroomIcon(source: "official" | "custom"): L.DivIcon {
  const bg = source === "official" ? "#0039A6" : "#0a0a0a";
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
    html: `<div style="width:22px;height:22px;border-radius:9999px;background:#fff;border:3px solid #EE352E;box-shadow:0 1px 3px rgba(0,0,0,.5);"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}
