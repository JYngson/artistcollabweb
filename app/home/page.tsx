'use client'
import { useSearchParams } from 'next/navigation';

export default function AccessToken() {
  const searchParams = useSearchParams()

  let accessToken = searchParams.get('accessToken');
  let refreshToken = searchParams.get('refreshToken'); 

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
