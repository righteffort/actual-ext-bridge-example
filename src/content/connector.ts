import { LocalBridge, BridgeConnector } from "@righteffort/actual-ext-bridge";
import { getBaseUrl, onBaseUrlChange } from "../shared/storage";

/**
 * Content Script Connector
 * Manages the connection between the Extension and the Page (Main World).
 */

let bridge: LocalBridge | null = null;
const connector = new BridgeConnector();

async function init() {
  const baseUrl = await getBaseUrl();
  console.log(
    "AXBE: Connector: Initializing...",
    baseUrl ? `Target: ${baseUrl}` : "No URL configured",
  );

  // If we have a URL, start the connector arbitration
  // (In a real impl, we'd check if window.location.origin matches baseUrl first)
  if (baseUrl) {
    if (window.location.origin === baseUrl) {
      console.log("ABXE: starting connector...");
      await connector.start();
      console.log("ABXE: ... started connector");
    }
  }
}

// Listen for Master Grant events
connector.on("primary-changed", async (isMaster) => {
  console.log("AXBE: Connector: Master Status Changed:", isMaster);

  if (isMaster) {
    if (!bridge) {
      bridge = new LocalBridge();
    }

    const baseUrl = await getBaseUrl();
    if (baseUrl) {
      try {
        await bridge.connect({ baseUrl });
        console.log("AXBE: Connector: Bridge Connected");

        // Subscribe and forward state to background/sidepanel via runtime messages if needed
        // For now, the sidepanel uses RemoteBridge which goes through the Arbiter/Background
        bridge.subscribe((state) => {
          console.log("AXBE: Connector: Bridge State Update", state);
          // TODO: Forward to background if architecture demands it,
          // but RemoteBridge usually polls or sends messages to Content Script.
        });
      } catch (e) {
        console.error("AXBE: Connector: Failed to connect bridge", e);
      }
    }
  } else {
    if (bridge) {
      bridge.disconnect();
      console.log("AXBE: Connector: Bridge Disconnected (Revoked Master)");
    }
  }
});

// Listen for configuration changes
onBaseUrlChange((newUrl) => {
  if (newUrl && window.location.origin === newUrl) {
    connector.start();
  } else {
    // Stop connector if URL no longer matches
    // (Stub: connector.stop() would be here if API supported it)
  }
});

init();
