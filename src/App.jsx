// import { useEffect, useState } from "react";
// import { BrowserRouter } from "react-router-dom";
// import AppRoutes from "./routes";
// import { checkActivationStatus } from "./services/api.service";

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
//     return <p>Loading application...</p>;
//   }

//   return (
//     <BrowserRouter>
//       <AppRoutes activated={activated} setActivated={setActivated} />
//     </BrowserRouter>
//   );
// }

// export default App;

// // App.js
// import { useEffect, useState } from "react";
// import AppRoutes from "./routes";
// import { checkActivationStatus } from "./services/api.service";
// import Intro from "./components/Intro.jsx";
// import Footer from "./components/Footer.jsx";
// import "./styles/global.css";

// function App() {
//   const [loading, setLoading] = useState(true);
//   const [activated, setActivated] = useState(false);
//   const [showIntro, setShowIntro] = useState(true);

//   useEffect(() => {
//     async function init() {
//       const status = await checkActivationStatus();
//       setActivated(status);

//       // Show intro for 6 seconds
//       setTimeout(() => {
//         setShowIntro(false);
//         setLoading(false);
//       }, 6000);
//     }
//     init();
//   }, []);

//   if (showIntro) return <Intro />;

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
//       {/* <Footer /> */}
//     </div>
//   );
// }

// export default App;




// INTRO REMOVEDINTRO REMOVEDINTRO REMOVEDINTRO REMOVEDINTRO REMOVEDINTRO REMOVEDINTRO REMOVEDINTRO REMOVEDINTRO REMOVEDINTRO REMOVED
// INTRO REMOVEDINTRO REMOVEDINTRO REMOVEDINTRO REMOVED

// App.js
import { useEffect, useState } from "react";
import AppRoutes from "./routes";
import { checkActivationStatus } from "./services/api.service";
import "./styles/global.css";

function App() {
  const [loading, setLoading] = useState(true);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    async function init() {
      const status = await checkActivationStatus();
      setActivated(status);
      setLoading(false);
    }
    init();
  }, []);

  if (loading) {
    return (
      <div className="flex-center" style={{ height: "100vh", fontSize: "1.2rem", color: "var(--text)" }}>
        Loading application...
      </div>
    );
  }

  return (
    <div className="app-layout flex" style={{ flexDirection: "column", minHeight: "100vh" }}>
      <AppRoutes activated={activated} setActivated={setActivated} />
    </div>
  );
}

export default App;