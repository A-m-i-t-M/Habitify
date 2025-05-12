import React, { useEffect, useState } from 'react'
import {FaSearch} from 'react-icons/fa'
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
export default function Header() {
    const {currentUser} = useSelector( state => state.user);
    const navigate = useNavigate();
    // console.log(currentUser);
    
    const handleHome = ()=>{
        if(!currentUser){
            navigate("/");
        }else{
            navigate("/home");
        }
    }
 
    return (
        <>
          <header className="w-full bg-gradient-to-r from-gray-900 via-black to-gray-900 shadow-lg border-b border-green-400 backdrop-blur-md z-50">
            <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">

                {/* Logo */}
                <Link to="/home" className="flex items-center space-x-2">
                <h1 className="text-3xl font-extrabold text-green-400 tracking-wide hover:text-green-300 transition drop-shadow-[0_0_5px_#22c55e]">
                    Habitify
                </h1>
                </Link>

                {/* Navigation */}
                <nav className="hidden sm:flex gap-6 items-center">
                <button onClick={handleHome}>
                    <span className="text-green-400 text-sm font-semibold hover:underline transition">
                    Home
                    </span>
                </button>

                <Link to="/about">
                    <span className="text-green-400 text-sm font-semibold hover:underline transition">
                    About
                    </span>
                </Link>

                {currentUser ? (
                    <a href="/profile" className="hover:opacity-90 transition">
                    <img
                        src={currentUser.avatar}
                        alt="Profile"
                        className="w-9 h-9 rounded-full object-cover border-2 border-green-400 shadow-md"
                    />
                    </a>
                ) : (
                    <button
                    onClick={() => navigate('/signin')}
                    className="text-green-400 text-sm border border-green-500 px-4 py-1.5 rounded-md hover:bg-green-500 hover:text-black font-semibold shadow-sm transition"
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