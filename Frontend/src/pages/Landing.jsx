import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/signup", {state: {email}});
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center">
      {/* Navbar */}
      <nav className="w-full flex justify-between items-center p-4 bg-black">
        <h1 className="text-xl font-bold text-green-500">Habitify</h1>
        <button className="bg-green-500 px-4 py-2 rounded">Sign In</button>
      </nav>

      {/* Hero Section */}
      <header className="text-center py-20">
        <h2 className="text-3xl font-bold mb-4">Welcome to Habitify</h2>
        <p className="text-gray-300">Your dedicated personal progress app.</p>
        <div className="mt-4">
          <input 
            className="p-2 text-black rounded" 
            placeholder="Enter your email" 
            type="email"
            id="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="bg-green-500 px-4 py-2 rounded ml-2" onClick={handleClick} disabled = {!email.includes("@gmail.com")}>Get Started</button>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-10 text-center">
        <h3 className="text-2xl font-bold mb-4">Why Choose Us?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-800 rounded">Connect</div>
          <div className="p-4 bg-gray-800 rounded">Reflect</div>
          <div className="p-4 bg-gray-800 rounded">Elevate</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-black p-4 text-center text-gray-400">
        &copy; 2025 Habitify, Inc.
      </footer>
    </div>
  );
}
