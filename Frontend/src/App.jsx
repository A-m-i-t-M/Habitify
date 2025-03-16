import React from 'react'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import Demo from './pages/Demo'
import Landing from './pages/Landing'
import Signup from './pages/Signup'
import Verification from './pages/Verification'
import Home from './pages/Home'
import Signin from './pages/Signin'
import Header from '../components/Header'
import Profile from './pages/Profile'
import Friendlist from './pages/Friendlist'
import Habits from './pages/Habits'
import ViewHabits from './pages/ViewHabits'
import PrivateRoute from '../components/PrivateRoute'
export default function App() {
  return <>
    <BrowserRouter>
    <Header/>
      <Routes>
        
        {/* <Route path='/header' element={<Header/>}/> */}
        <Route path='/' element={<Landing/>}/>
        <Route path='/demo' element={<Demo/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/signin' element={<Signin/>}/>
        <Route path='/verify' element={<Verification/>}/>
        <Route element={<PrivateRoute/>}>
          <Route path='/home' element={<Home/>}/>
          <Route path='/profile' element={<Profile/>}/>
          <Route path='/friends' element={<Friendlist/>}/>
          <Route path='/habits' element={<Habits/>}/>
          <Route path='/all-habits' element={<ViewHabits/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  </>
}
