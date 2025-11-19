import Navbar from "./components/Navbar";

import Hero from "./components/Hero";
import Footer from "./components/Footer";
export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* Components */}
      <Navbar />
      <Hero />
      <Footer />
    </div>
  );
}

