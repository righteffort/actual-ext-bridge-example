import { BridgeArbiter } from "@righteffort/actual-ext-bridge";

/**
 * Background Service Worker
 * Acts as the orchestrator for the Single Master policy.
 */

// Instantiate the Arbiter
const arbiter = new BridgeArbiter();
arbiter.start();

// Listen for side panel opening (optional, good for UX)
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

console.log("Actual Budget Extension: Service Worker Initialized");
