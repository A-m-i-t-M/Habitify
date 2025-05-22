import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Landing() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState({
    feature1: false,
    feature2: false,
    feature3: false,
    team: false,
  });

  // Refs for intersection observer
  const feature1Ref = useRef(null);
  const feature2Ref = useRef(null);
  const feature3Ref = useRef(null);
  const teamRef = useRef(null);

  // Intersection observer setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.id) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.id]: entry.isIntersecting
            }));
          }
        });
      },
      { threshold: 0.3 }
    );

    // Observe elements
    if (feature1Ref.current) observer.observe(feature1Ref.current);
    if (feature2Ref.current) observer.observe(feature2Ref.current);
    if (feature3Ref.current) observer.observe(feature3Ref.current);
    if (teamRef.current) observer.observe(teamRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleClick = () => {
    navigate("/signup", { state: { email } });
  };

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 bg-black relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center max-w-3xl relative z-10"
        >
          <h1 className="text-5xl md:text-7xl font-light tracking-widest mb-6">
            HABITIFY
          </h1>
          <p className="text-lg md:text-xl font-light tracking-wider text-white/70 mb-10">
            Build better habits, together.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-8">
            <input
              className="w-full md:w-64 p-3 bg-transparent border border-white/30 text-white focus:outline-none focus:border-white transition-colors duration-300 text-sm"
              placeholder="Enter your email"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button 
              className="w-full md:w-auto px-6 py-3 bg-white text-black hover:bg-gray-200 transition-colors duration-300 text-xs uppercase tracking-widest font-light disabled:opacity-50"
              onClick={handleClick}
              disabled={!email.includes("@")}
            >
              START NOW
            </button>
          </div>
        </motion.div>

        {/* Animated background circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-10">
          <motion.div 
            className="absolute top-0 left-0 w-full h-full rounded-full border border-white/20"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ 
              repeat: Infinity,
              duration: 8,
              ease: "easeInOut" 
            }}
          />
          <motion.div 
            className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full border border-white/20"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{ 
              repeat: Infinity,
              duration: 10,
              ease: "easeInOut" 
            }}
          />
        </div>
      </section>
      
      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <p className="text-white/50 text-xs tracking-widest uppercase mb-2">Scroll</p>
        <div className="w-[1px] h-8 bg-white/30"></div>
      </motion.div>

      {/* Features Section */}
      <section className="py-20 px-6 md:py-32 bg-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-light text-center mb-20 tracking-widest uppercase">
            Features
          </h2>
          
          {/* Feature 1 */}
          <div 
            id="feature1"
            ref={feature1Ref}
            className="mb-32"
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={isVisible.feature1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col md:flex-row items-center gap-12"
            >
              <div className="md:w-1/2">
                <h3 className="text-2xl font-light tracking-wider mb-4">Track Your Progress</h3>
                <p className="text-white/70 leading-relaxed mb-6">
                  Set measurable goals, track your daily progress, and witness your growth over time.
                  Our intuitive interface makes it easy to stay accountable and motivated.
                </p>
                <div className="w-12 h-[1px] bg-white/30"></div>
              </div>
              <div className="md:w-1/2 border border-white/10 aspect-video flex items-center justify-center">
                <span className="text-white/50 text-sm uppercase tracking-widest">Feature Image</span>
              </div>
            </motion.div>
          </div>
          
          {/* Feature 2 */}
          <div 
            id="feature2"
            ref={feature2Ref}
            className="mb-32"
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={isVisible.feature2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col md:flex-row-reverse items-center gap-12"
            >
              <div className="md:w-1/2">
                <h3 className="text-2xl font-light tracking-wider mb-4">Connect With Friends</h3>
                <p className="text-white/70 leading-relaxed mb-6">
                  Share your journey with friends, compete on leaderboards, and motivate each other.
                  Building habits is easier when you have a supportive community.
                </p>
                <div className="w-12 h-[1px] bg-white/30"></div>
              </div>
              <div className="md:w-1/2 border border-white/10 aspect-video flex items-center justify-center">
                <span className="text-white/50 text-sm uppercase tracking-widest">Feature Image</span>
              </div>
            </motion.div>
          </div>
          
          {/* Feature 3 */}
          <div 
            id="feature3"
            ref={feature3Ref}
            className="mb-32"
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={isVisible.feature3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col md:flex-row items-center gap-12"
            >
              <div className="md:w-1/2">
                <h3 className="text-2xl font-light tracking-wider mb-4">AI-Powered Assistance</h3>
                <p className="text-white/70 leading-relaxed mb-6">
                  Get personalized guidance from Habita, our AI assistant. From motivation quotes to 
                  detailed action plans, Habita helps you stay on track and overcome obstacles.
                </p>
                <div className="w-12 h-[1px] bg-white/30"></div>
              </div>
              <div className="md:w-1/2 border border-white/10 aspect-video flex items-center justify-center">
                <span className="text-white/50 text-sm uppercase tracking-widest">Feature Image</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section 
        id="team"
        ref={teamRef}
        className="py-20 px-6 md:py-32 bg-black"
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible.team ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-3xl font-light text-center mb-20 tracking-widest uppercase">
            Our Story
          </h2>
          
          <div className="flex flex-col md:flex-row gap-12 items-center justify-center">
            <div className="md:w-1/3 text-center">
              <div className="w-40 h-40 rounded-full border border-white/20 mx-auto mb-6 flex items-center justify-center">
                <span className="text-white/50 text-sm uppercase tracking-wider">Photo</span>
              </div>
              <h3 className="text-xl font-light mb-2">Amit Arunkumar Madhabhavi</h3>
              <p className="text-white/70 text-sm mb-4">Full Stack Developer</p>
              <div className="flex justify-center space-x-4">
                <a href="#" className="text-white/50 hover:text-white transition-colors duration-300">GitHub</a>
                <a href="#" className="text-white/50 hover:text-white transition-colors duration-300">LinkedIn</a>
              </div>
            </div>
            
            <div className="md:w-1/3 text-center">
              <div className="w-40 h-40 rounded-full border border-white/20 mx-auto mb-6 flex items-center justify-center">
                <span className="text-white/50 text-sm uppercase tracking-wider">Photo</span>
              </div>
              <h3 className="text-xl font-light mb-2">Aagnik Ghosh</h3>
              <p className="text-white/70 text-sm mb-4">Full Stack Developer</p>
              <div className="flex justify-center space-x-4">
                <a href="#" className="text-white/50 hover:text-white transition-colors duration-300">GitHub</a>
                <a href="#" className="text-white/50 hover:text-white transition-colors duration-300">LinkedIn</a>
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center max-w-2xl mx-auto">
            <p className="text-white/70 mb-6 leading-relaxed">
              We built Habitify during our pre-final year at MS Ramaiah Institute of Technology in Bangalore. 
              As passionate full-stack developers, we wanted to create a platform where people could come together 
              to build better habits, self-improve, and become the best versions of themselves.
            </p>
            <p className="text-white/70 leading-relaxed">
              Our vision is to foster a community where personal growth is celebrated, shared, and supported. 
              We believe that lasting change happens through consistent small actions and the power of community.
            </p>
            
            <a 
              href="https://github.com/your-repo-here" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block mt-8 px-6 py-3 border border-white/30 hover:border-white text-sm uppercase tracking-wider transition-colors duration-300"
            >
              View Project on GitHub
            </a>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center bg-black border-t border-white/10">
        <p className="text-white/50 text-xs tracking-wider">&copy; {new Date().getFullYear()} HABITIFY</p>
      </footer>
    </div>
  );
}
