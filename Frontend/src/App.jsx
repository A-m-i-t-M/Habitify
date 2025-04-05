import React from 'react'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import Landing from './pages/Landing'
import Signup from './pages/Signup'
import Verification from './pages/Verification'
import Home from './pages/Home'
import Signin from './pages/Signin'
import Header from '../components/Header'
import Profile from './pages/Profile'
import Friendlist from './pages/Friendlist'
import Habits from './pages/Habits'
import PrivateRoute from '../components/PrivateRoute'
import CreatePost from './pages/CreatePost'
import Fyp from './pages/Fyp'
import FriendsList from './pages/FriendListing'
import Chat from './pages/Chat'
import Leaderboard from './pages/Leaderboard'
export default function App() {
  return <>
    <BrowserRouter>
      <Header/>
        <Routes>
          
          {/* <Route path='/header' element={<Header/>}/> */}
          <Route path='/' element={<Landing/>}/>
          <Route path='/signup' element={<Signup/>}/>
          <Route path='/signin' element={<Signin/>}/>
          <Route path='/verify' element={<Verification/>}/>
          <Route element={<PrivateRoute/>}>
            <Route path='/home' element={<Home/>}/>
            <Route path='/profile' element={<Profile/>}/>
            <Route path='/friends' element={<Friendlist/>}/>
            <Route path='/habits' element={<Habits/>}/>
            <Route path='/new-post' element={<CreatePost/>}/>
            <Route path='/fyp' element={<Fyp/>}/>
            <Route path='/friendforchat' element={<FriendsList/>}/>
            <Route path="/chat/:friendId" element={<Chat />} />
            <Route path='leaderboard' element={<Leaderboard/>}/>
          </Route>
        </Routes>
    </BrowserRouter>
  </>
}
