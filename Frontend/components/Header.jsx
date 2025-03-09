import React, { useEffect, useState } from 'react'
import {FaSearch} from 'react-icons/fa'
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
export default function Header() {
    const {currentUser} = useSelector( state => state.user);
    const [searchItem, setSearchItem] = useState('');
    const navigate = useNavigate();
  
    useEffect(()=>{
      const urlParams = new URLSearchParams(location.search);
      const urlsSearchItem = urlParams.get('searchItem');
      if(urlsSearchItem)
          setSearchItem(urlsSearchItem);
    },[location.search]);
  
  
    const handleSubmit = (e)=>{
      e.preventDefault();
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set('searchItem', searchItem);
      const searchQuery = urlParams.toString();
      navigate(`/search?${searchQuery}`);
    };
  
    return <>
      {/* The CSS Part I can revise aaraamse later on */}
      <header className=' w-full flex items-center p-4 bg-black '>
          <div className=' w-full flex justify-between items-center mx-auto max-w-6xl p-3'>
            <div>
                <Link to='/'>
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
            <div>
                <ul className=' flex gap-4  items-center'>
                    <Link to='/'>
                        <li className=' hidden my-1 sm:inline hover:underline bg-green-500'>
                            Home
                        </li>
                    </Link>
                    <Link to='/about'>
                        <li className=' hidden sm:inline hover:underline bg-green-500'>
                            About
                        </li>
                    </Link>
                    <Link to='/profile'>
                        {
                            currentUser ? ( 
                                <img src={currentUser.avatar} alt='pfp' className='bg-green-500 px-4 py-2 rounded'/>
                            )
                            :(   
                                <li className=' bg-green-500 px-4 py-2 rounded'>
                                    Sign In
                                </li>
                            )
                        }
                    </Link>
                </ul>
            </div>
          </div>
      </header>
    </>
  }
  