import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/signup", {state: {email}});
  };

  return (
    <div className="bg-bg text-text-primary min-h-screen flex flex-col items-center font-serif">
      {/* Navbar */}
      {/* <nav className="w-full flex justify-between items-center p-4 bg-black">
        <h1 className="text-xl font-bold text-green-500">Habitify</h1>
        <button className="bg-green-500 px-4 py-2 rounded" onClick={()=>navigate("/signin")}>Sign In</button>
      </nav> */}

      {/* Hero Section */}
      <header className="text-center py-20 px-4">
        <h2 className="text-4xl font-bold mb-6 text-primary">Welcome to Habitify</h2>
        <p className="text-text-muted text-lg">Your dedicated personal progress app.</p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2">
          <input 
            className="p-3 bg-bg border border-secondary rounded-lg text-text-primary placeholder-text-muted focus:ring-accent focus:border-accent shadow-sm w-full sm:w-auto"
            placeholder="Enter your email"
            type="email"
            id="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
          />
          <button 
            className="bg-primary text-bg px-6 py-3 rounded-lg hover:bg-accent transition shadow-md disabled:opacity-50 w-full sm:w-auto"
            onClick={handleClick} 
            disabled = {!email.includes("@gmail.com")}
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 text-center px-4 w-full max-w-4xl">
        <h3 className="text-3xl font-bold mb-8 text-primary">Why Choose Us?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-bg border border-secondary rounded-xl shadow-md text-text-primary">Connect</div>
          <div className="p-6 bg-bg border border-secondary rounded-xl shadow-md text-text-primary">Reflect</div>
          <div className="p-6 bg-bg border border-secondary rounded-xl shadow-md text-text-primary">Elevate</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-primary p-6 text-center text-bg mt-auto">
        &copy; 2025 Habitify, Inc.
      </footer>
    </div>
  );
}
