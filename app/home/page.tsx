'use client'
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Modal from 'react-modal';
import Image from 'next/image'

export default function AccessToken() {
  const searchParams = useSearchParams();
  const axios = require('axios')
  const [modalOpen, setModalOpen] = useState<Boolean>(false);

  let accessToken:string | null = searchParams.get('accessToken');
  let refreshToken:string | null = searchParams.get('refreshToken');
  let [artist, setArtist] = useState<String| null>();
  let [artistList, setArtistList] = useState<any[]>()
  let refreshTokenRedeemed:boolean = false


  const modalHandler = () => {
    modalOpen === false ? setModalOpen(true) : setModalOpen(false)
  }

  const search = () => {
    if (artist == null) {
      return
    }
    axios({
      method: 'get',
      url: 'https://api.spotify.com/v1/search',
      withCredentials: false,
      params: {
        q: artist,
        type:'artist',
        limit: 5
      },
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      }
    }).then(response =>
      setArtistList(response.data.artists.items),
      modalHandler()
    ).catch(err => {
      console.log(err)
    })
  }

  const modalStyle = {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,1)'
  }

  const refresh = () => {
    window.location.assign(`http://localhost:8080/tokenRefresh?refreshToken=${refreshToken}`)
    refreshTokenRedeemed = true
  }

  setTimeout(() => {
    if (refreshTokenRedeemed == true){
      window.location.assign('http://localhost:3000/login')
    } else {
      refresh()
    }
  }, 3300000);

  const log = () => {
    console.log(artistList)
  }

  return (
    <div id='HomePage' className='flex flex-col relative max-w-screen h-screen justify-center items-center bg-zinc-300 overflow-hidden'>
      
      <h2 className='mb-2'>access Token: {accessToken? 'exists' : 'n/a'}</h2>
      <h2>refresh token: {refreshToken? 'exists ': 'n/a'}</h2>

      <div id='search' className='my-4 flex flex-col items-center'>
        <input 
          id='searchBar'
          type='search' 
          name='artistSearch' 
          onChange={(e) => setArtist(e.target.value)}
          className='h-10 w-96 px-4 rounded-lg text-center mb-2' 
          placeholder='Artist Name'
        />
          <button 
            id='submitSearch'
            type='submit'
            className='h-12 w-24 rounded-xl text-center bg-spotifyGreen' 
            onClick={search}>
              Search
          </button>
      </div>

      <button 
        id='test'
        className='h-12 w-24 mb-4 rounded-xl text-center bg-spotifyGreen' 
        onClick={log}>
          Log
      </button>

      <button 
        id='test'
        className='h-12 w-24 rounded-xl text-center bg-spotifyGreen' 
        onClick={modalHandler}>
          Modal
      </button>

      <Modal isOpen = {modalOpen} style={{modalStyle}}>
        <div id='searchResults' className='flex flex-col max-w-screen overflow-scroll justify-center items-center bg-black'>
          <button className='h-12 w-24 m-2 self-start rounded-xl text-center bg-spotifyGreen' onClick={modalHandler}>
            Close
          </button>
          {
            artistList?.map(artist => {
              return (
                <div key={artist.id} id='Card' className='w-11/12 h-40 flex items-center bg-spotifyGreen my-2 rounded-xl'>
                  <Image
                    src={artist.images[2].url}
                    alt='spotify artist pic'
                    className='rounded-3xl mx-6'
                    width={100}
                    height={100}
                  />
                  <div className='flex flex-col'>
                    <h1>Name : {artist.name}</h1>
                    <h2>ID: {artist.id}</h2>
                    <p>Followers: {artist.followers.total}</p>
                  </div>
                </div>
              )
            })
          }
        </div>
      </Modal>
    </div> 
  )
}

