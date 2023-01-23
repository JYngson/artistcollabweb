'use client'
import { useEffect } from 'react';
import { PacmanLoader } from 'react-spinners';
import { useSearchParams } from 'next/navigation';



export default function HomePage() {
  const searchParams = useSearchParams()
  let accessToken = searchParams.get('accessToken');
  let refreshToken = searchParams.get('refreshToken'); 

  const tokenCheck = () => {
    if (searchParams.has('accessToken') && searchParams.has('refreshToken')){
      window.location.assign(`http://localhost:3000/home?accessToken=${accessToken}&refreshToken=${refreshToken}`)
    } else {
      window.location.assign('http://localhost:3000/login')
    }
  }

  useEffect(() => {
    tokenCheck()
  }, [])

  return (
    <div className='flex flex-col w-screen h-screen justify-center items-center bg-black'>
      <PacmanLoader color='#1DB954'/>
      <h1 className='text-white'>Loading...</h1>
    </div>
  )
}
