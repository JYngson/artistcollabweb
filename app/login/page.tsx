"use client"
import Image from 'next/image'
import BG from '../../images/LoginBG.jpg'

export default function LoginPage(){
  const redirect = (e:React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    window.location.assign('http://localhost:8080/token')
  }

  return(
    <div id='LoginPage' className='flex h-screen w-screen justify-center items-center relative bg-black'>
      <Image
        src={BG}
        alt='background image'
        className='absolute object-cover z-0 w-full h-full animate-fade-in'
      />
      <div id='LoginCard' className='flex flex-col w-5/12 h-2/6 justify-center items-center bg-zinc-800/[0.8] rounded-xl animate-fade-in z-50'>
        <h1 className='mb-4 text-white'>Please log in to your <span className='text-spotifyGreen'>Spotify</span> account to continue!</h1>
        <button id='LoginButton' className='w-3/6 h-1/4 rounded-3xl text-2xl bg-spotifyGreen text-black' onClick={redirect}>Login</button>
      </div>
    </div>
  )
}