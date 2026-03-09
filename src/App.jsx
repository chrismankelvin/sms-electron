
// import { useEffect, useState } from "react";
// import AppRoutes from "./routes";
// import { checkActivationStatus } from "./services/api.service";
// import "./styles/global.css";

// function App() {
//   const [loading, setLoading] = useState(true);
//   const [activated, setActivated] = useState(false);

//   useEffect(() => {
//     async function init() {
//       const status = await checkActivationStatus();
//       setActivated(status);
//       setLoading(false);
//     }
//     init();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex-center" style={{ height: "100vh", fontSize: "1.2rem", color: "var(--text)" }}>
//         Loading application...
//       </div>
//     );
//   }

//   return (
//     <div className="app-layout flex" style={{ flexDirection: "column", minHeight: "100vh" }}>
//       <AppRoutes activated={activated} setActivated={setActivated} />
//     </div>
//   );
// }

// export default App;


// src/App.jsx
import { useEffect, useState } from "react";
import AppRoutes from "./routes";

import { checkActivationStatus, initDatabase, isElectron } from "./services/api.service";
import "./styles/global.css";

function App() {
  const [loading, setLoading] = useState(true);
  const [activated, setActivated] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        // Log environment
        if (isElectron()) {
          console.log('Running in Electron mode');
          
          // Initialize database tables if needed
          try {
            await initDatabase();
          } catch (dbError) {
            console.warn('Database initialization skipped:', dbError);
          }
        } else {
          console.log('Running in browser mode');
        }

        // Check activation status
        const status = await checkActivationStatus();
        setActivated(status);
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    init();
  }, []);

  if (error) {
    return (
      <div className="flex-center" style={{ 
        height: "100vh", 
        flexDirection: "column",
        fontSize: "1.2rem", 
        color: "var(--error)" 
      }}>
        <div>Error loading application:</div>
        <div style={{ fontSize: "1rem", marginTop: "1rem" }}>{error}</div>
        <button 
          onClick={() => window.location.reload()}
          style={{ marginTop: "2rem", padding: "0.5rem 1rem" }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-center" style={{ 
        height: "100vh", 
        fontSize: "1.2rem", 
        color: "var(--text)" 
      }}>
        <div style={{ textAlign: "center" }}>
          <div>Loading application...</div>
          {!isElectron() && (
            <div style={{ fontSize: "0.9rem", marginTop: "1rem", color: "var(--text-muted)" }}>
              (Browser mode - some features may be limited)
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout flex" style={{ 
      flexDirection: "column", 
      minHeight: "100vh" 
    }}>
      <AppRoutes activated={activated} setActivated={setActivated} />
    </div>
  );
}

export default App;