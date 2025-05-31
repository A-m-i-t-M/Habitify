import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
export default function Header() {
    const {currentUser} = useSelector( state => state.user);
    const navigate = useNavigate();   
    const handleHome = ()=>{
        if(!currentUser){
            navigate("/");
        }else{
            navigate("/home");
        }
    }
    return (
        <>
          <header className="w-full bg-primary shadow-md border-b border-secondary backdrop-blur-md z-50">
            <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
                <Link to="/home" className="flex items-center space-x-2">
                <h1 className="text-3xl font-serif font-bold text-secondary tracking-wide hover:text-accent transition">
                    Habitify
                </h1>
                </Link>
                <nav className="hidden sm:flex gap-6 items-center">
                <button onClick={handleHome}>
                    <span className="text-secondary text-sm font-semibold hover:text-accent hover:underline transition">
                    Home
                    </span>
                </button>
                <Link to="/about">
                    <span className="text-secondary text-sm font-semibold hover:text-accent hover:underline transition">
                    About
                    </span>
                </Link>
                {currentUser ? (
                    <a href="/profile" className="hover:opacity-90 transition">
                    <img
                        src={currentUser.avatar}
                        alt="Profile"
                        className="w-9 h-9 rounded-full object-cover border-2 border-secondary shadow-sm"
                    />
                    </a>
                ) : (
                    <button
                    onClick={() => navigate('/signin')}
                    className="text-secondary text-sm border border-secondary px-4 py-1.5 rounded-lg hover:bg-secondary hover:text-bg font-semibold shadow-sm transition"
                    >
                    Sign In
                    </button>
                )}
                </nav>
            </div>
            </header>
        </>
      );
  }