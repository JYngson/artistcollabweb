'use client'
import { useSearchParams, useRouter } from 'next/navigation';

export default function AccessToken() {
  const searchParams = useSearchParams()
  let accessToken:string | null = searchParams.get('accessToken');
  let refreshToken:string | null = searchParams.get('refreshToken');
  let hours:number = 0

  const refresh = () => {
    window.location.assign(`http://localhost:8080/tokenRefresh?refreshToken=${refreshToken}`)
    hours = 1
  }

  setTimeout(() => {
    if (hours == 1){
      window.location.assign('http://localhost:3000/login')
    } else {
      refresh()
    }
  }, 3300000);

  return (
    <div id='HomePage' className='w-screen h-screen bg-zinc-300'>
      <div id='Card' className='w-1/6 h-3/6 flex flex-col justify-center items-center bg-blue-300'>
        <h1>Card</h1>
        <h2>Artist Name</h2>
        <p>Albums</p>
      </div>
      
      <h2>access Token: {accessToken}</h2>
      <h2>refresh token: {refreshToken? refreshToken: 'nothing'}</h2>
    </div> 
  )
}
