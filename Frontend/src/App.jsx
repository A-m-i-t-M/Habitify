import React from 'react'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import Demo from './pages/Demo'
import Landing from './pages/Landing'
import Signup from './pages/Signup'
export default function App() {
  return <>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Landing/>}/>
        <Route path='/demo' element={<Demo/>}/>
        <Route path='/signup' element={<Signup/>}/>
      </Routes>
    </BrowserRouter>
  </>
}
