// import { useEffect } from "react";
// 
// // ── Tawk.to live-chat widget ──────────────────────────────────────────────────
// // Loaded side-by-side with the in-house FloatingChat bot for comparison.
// // The widget is rebranded to "UGN Chat" via the Tawk_API visitor/attributes hooks
// // and shifted left so it does not overlap the existing chatbot trigger.
// //
// // Configure your property/widget IDs from the Tawk.to dashboard:
// //   Admin ▸ Channels ▸ Chat Widget → the embed URL is
// //   https://embed.tawk.to/<PROPERTY_ID>/<WIDGET_ID>
// // Set them in .env as:
// //   VITE_PUBLIC_TAWK_PROPERTY_ID=...
// //   VITE_PUBLIC_TAWK_WIDGET_ID=...   (defaults to "default")
// 
// const PROPERTY_ID =
//   (import.meta.env.VITE_PUBLIC_TAWK_PROPERTY_ID as string | undefined) ??
//   "6a6c566571640b1d482b005a";
// const WIDGET_ID =
//   (import.meta.env.VITE_PUBLIC_TAWK_WIDGET_ID as string | undefined) ?? "1jurj2vlo";
// 
// const WIDGET_TITLE = "UGN Chat";
// 
// declare global {
//   interface Window {
//     Tawk_API?: Record<string, unknown> & {
//       onLoad?: () => void;
//       setAttributes?: (attrs: Record<string, string>, cb?: (err?: unknown) => void) => void;
//       visitor?: Record<string, string>;
//       customStyle?: Record<string, unknown>;
//     };
//     Tawk_LoadStart?: Date;
//   }
// }
// 
// const SCRIPT_ID = "tawk-to-script";

export default function TawkChat() {
  // Tawk.to widget is commented out / disabled.
  return null;

  /*
  useEffect(() => {
    if (!PROPERTY_ID) return;
    if (document.getElementById(SCRIPT_ID)) return;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    window.Tawk_API.customStyle = {
      visitor: { name: WIDGET_TITLE },
      zIndex: 9998,
    };

    window.Tawk_API.onLoad = function () {
      try {
        window.Tawk_API?.setAttributes?.({ name: WIDGET_TITLE }, () => {});
      } catch {}
    };

    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.async = true;
    s.src = `https://embed.tawk.to/${PROPERTY_ID}/${WIDGET_ID}`;
    s.charset = "UTF-8";
    s.setAttribute("crossorigin", "*");

    const first = document.getElementsByTagName("script")[0];
    first?.parentNode?.insertBefore(s, first);
  }, []);

  if (!PROPERTY_ID) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "78px",
        right: "20px",
        zIndex: 9997,
        fontSize: "10px",
        fontWeight: 600,
        color: "#6b7280",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        padding: "2px 8px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      UGN Chat (Tawk.to)
    </div>
  );
  */
}
