'use client'
import { useEffect } from 'react';


export default function HomePage() {

  const currentURL = window.location.search;
  const searchParams = new URLSearchParams(currentURL);


  const tokenCheck = () => {
    if (searchParams.has('access_token') && searchParams.has('refresh_token')){
      window.location.assign('http://localhost:3000/accessToken?')
    } else {
      window.location.assign('http://localhost:3000/login')
    }
  }

  useEffect(() => {
    tokenCheck()
  }, [])

  return (
    <>
      <h1>Loading...</h1>
    </>
  )
}
