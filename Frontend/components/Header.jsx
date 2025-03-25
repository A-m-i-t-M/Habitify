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
 
    return <>
      {/* The CSS Part I can revise aaraamse later on */} 
      {/* <header className=' w-full flex items-center p-3 bg-black fixed top-0 left-0 z-50'> */}
      <header className=' w-full flex items-center p-3 bg-black'>
          <div className=' w-full flex justify-between items-center mx-auto max-w-6xl p-3'>
            <div>
                <Link to='/home'>
                    <h1 className="text-xl font-bold text-green-500">Habitify</h1>
                </Link>
            </div>
          {/* <form className=' bg-slate-100 p-3 rounded-lg flex items-center' onSubmit={handleSubmit}>
              <input type='text' placeholder='Search' className=' bg-transparent focus:outline-none w-24 sm:w-64'
              onChange={(e)=>setSearchItem(e.target.value)}
              />
              <button type='submit'>
                  <FaSearch className=' text-slate-500'/>
              </button>
          </form> */}
            <nav className='flex justify-between'>
                <ul className=' flex gap-8 items-center space-x-6'>
                    <button onClick={handleHome}>
                        <li className='px-1 py-2 hidden  sm:inline hover:underline text-green-500'>
                            Home
                        </li>
                    </button>
                    <Link to='/about'>
                        <li className='px-4 py-2 hidden sm:inline hover:underline text-green-500'>
                            About
                        </li>
                    </Link>
                    
                        {
                            currentUser ? ( 
                                <a href='/profile'>
                                <img src={currentUser.avatar} alt='pfp' style={{ height: '32px', width: '32px', borderRadius: '50%', objectFit: 'cover'}}/>
                                </a>
                            )
                            :(   
                                <li className=' '>
                                <button className="text-green-500 px-4 py-2 rounded" onClick={()=>navigate("/signin")}>Sign In</button>
                                </li>
                            )
                        }
                    {/* </Link> */}
                </ul>
            </nav>
          </div>
      </header>
    </>
  }