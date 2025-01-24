import React from 'react'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import Demo from './pages/Demo'
export default function App() {
  return <>
    <BrowserRouter>
      <Routes>
        <Route path='/demo' element={<Demo/>}/>
      </Routes>
    </BrowserRouter>
  </>
}
