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
          <header className="w-full bg-black shadow-md fixed top-0 left-0 right-0 z-50 border-b border-white/10">
            <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
                <Link to="/home" className="flex items-center space-x-2">
                <h1 className="text-2xl font-light text-white tracking-widest hover:text-gray-300 transition-colors duration-300">
                    HABITIFY
                </h1>
                </Link>
                <nav className="hidden sm:flex gap-8 items-center">
                <button onClick={handleHome} className="relative group">
                    <span className="text-white text-sm font-light tracking-wider group-hover:text-gray-300 transition-colors duration-300">
                    HOME
                    </span>
                    <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white group-hover:w-full transition-all duration-300"></span>
                </button>
                <Link to="/about" className="relative group">
                    <span className="text-white text-sm font-light tracking-wider group-hover:text-gray-300 transition-colors duration-300">
                    ABOUT
                    </span>
                    <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white group-hover:w-full transition-all duration-300"></span>
                </Link>
                {currentUser ? (
                    <a href="/profile" className="hover:opacity-90 transition-opacity">
                    <img
                        src={currentUser.avatar}
                        alt="Profile"
                        className="w-9 h-9 rounded-full object-cover border border-white/30 shadow-sm"
                    />
                    </a>
                ) : (
                    <button
                    onClick={() => navigate('/signin')}
                    className="text-black text-xs bg-white px-5 py-2 rounded-sm hover:bg-gray-200 font-light tracking-wider transition-colors duration-300"
                    >
                    SIGN IN
                    </button>
                )}
                </nav>
            </div>
          </header>
          <div className="h-[72px]"></div>
        </>
      );
  }