import { useEffect, useState } from "react";
import { getBaseUrl, setBaseUrl } from "../shared/storage";
import { RemoteBridge } from "@righteffort/actual-ext-bridge";

/**
 * Main Side Panel Application
 */
export default function App() {
  const [baseUrl, setBaseUrlState] = useState<string>("");
  const [storedUrl, setStoredUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Initializing...");

  // Stub remote bridge for now
  const [_bridge] = useState(() => new RemoteBridge());

  useEffect(() => {
    // Load initial config
    getBaseUrl().then((url) => {
      setStoredUrl(url);
      if (url) setBaseUrlState(url);
      setStatus(url ? "Ready to Connect" : "Needs Configuration");
    });
  }, []);

  const handleSaveConfig = async () => {
    try {
      // Basic validation
      const url = new URL(baseUrl).origin;
      
      // Request permissions (Optional Host Permissions)
      const granted = await chrome.permissions.request({
        origins: [`${url}/*`]
      });

      if (granted) {
        await setBaseUrl(url);
        setStoredUrl(url);
        setStatus("Configuration Saved. Please refresh Actual Budget tab.");
      } else {
        setStatus("Permission denied.");
      }
    } catch (e) {
      setStatus("Invalid URL format");
    }
  };

  return (
    <div style={{ padding: "16px", fontFamily: "sans-serif" }}>
      <h2>Actual Transaction Details</h2>
      
      <div style={{ marginBottom: "16px", padding: "8px", background: "#f5f5f5", borderRadius: "4px" }}>
        <strong>Status:</strong> {status}
      </div>

      {!storedUrl || storedUrl !== baseUrl ? (
         <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
           <label>
             Actual Budget URL:
             <input 
               type="text" 
               value={baseUrl} 
               onChange={(e) => setBaseUrlState(e.target.value)}
               placeholder="https://app.actualbudget.org"
               style={{ width: "100%", padding: "4px", marginTop: "4px" }}
             />
           </label>
           <button onClick={handleSaveConfig} style={{ padding: "8px" }}>
             Save & Authorize
           </button>
         </div>
      ) : (
        <div>
           <p>Connected to: <strong>{storedUrl}</strong></p>
           
           <hr style={{ margin: "16px 0" }} />
           
           <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <input 
                type="text" 
                placeholder="Account Name (e.g. My Checking)" 
                style={{ width: "100%", padding: "4px" }}
              />
              <button disabled>Import PoC (Disconnected)</button>
              <button disabled>Modify 'me' Notes</button>
              <button disabled>Split 'me' Transactions</button>
           </div>
        </div>
      )}
    </div>
  );
}
