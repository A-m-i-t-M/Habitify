import React from 'react'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import Demo from './pages/Demo'
import Landing from './pages/Landing'
import Signup from './pages/Signup'
import Verification from './pages/Verification'
import Home from './pages/Home'
import Signin from './pages/Signin'
export default function App() {
  return <>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Landing/>}/>
        <Route path='/demo' element={<Demo/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/signin' element={<Signin/>}/>
        <Route path='/verify' element={<Verification/>}/>
        <Route path='/home' element={<Home/>}/>
      </Routes>
    </BrowserRouter>
  </>
}
