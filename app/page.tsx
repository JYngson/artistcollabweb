'use client'
import { useEffect, useState } from 'react';

export default function HomePage() {
  const currentURL = window.location.search;
  const searchParams = new URLSearchParams(currentURL);

  let [accessToken, setAccessToken] = useState<String | null>();
  let [refreshToken, setRefreshToken] = useState<String | null>();

  const redirect = () => {
    window.location.assign('http://localhost:3000/login')
  }

  const tokenCheck = () => {
    if (searchParams.has('access_token') && searchParams.has('refresh_token')){
      setAccessToken(searchParams.get('access_token'))
      setRefreshToken(searchParams.get('refresh_token'))
    } else {
      redirect()
    }
  }

  useEffect(() => {
    tokenCheck()
  }, [])

  return (
    <div id='HomePage' className='w-screen h-screen bg-zinc-300'>
      <div id='Card' className='w-1/6 h-3/6 flex flex-col justify-center items-center bg-blue-300'>
        <h1>Card</h1>
        <h2>Artist Name</h2>
        <p>Albums</p>
      </div>
      
      <h2>access Token: {accessToken}</h2>
      <h2>Refresh Token: {refreshToken}</h2>
    </div> 
  )
}
