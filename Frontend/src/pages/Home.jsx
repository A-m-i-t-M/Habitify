import React from 'react'
import { useSelector } from 'react-redux'

export default function Home() {

  const {currentUser} = useSelector(state=> state.user);
  // console.log(currentUser);
  
  return (
    <div>Home</div>
  )
}