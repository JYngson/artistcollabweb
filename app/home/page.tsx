'use client'
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Modal from 'react-modal';

export default function AccessToken() {
  const searchParams = useSearchParams();
  const axios = require('axios')
  const [modalOpen, setModalOpen] = useState<Boolean>(false);

  let accessToken:string | null = searchParams.get('accessToken');
  let refreshToken:string | null = searchParams.get('refreshToken');
  let [artist, setArtist] = useState<String| null>();
  let [artistList, setArtistList] = useState<any[]>()
  let hours:number = 0

  const refresh = () => {
    window.location.assign(`http://localhost:8080/tokenRefresh?refreshToken=${refreshToken}`)
    hours = 1
  }

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
    });
  }

  setTimeout(() => {
    if (hours == 1){
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
      {/* <div id='searchResults' className='flex max-w-screen overflow-scroll justify-center'>
        {
          artistList?.map(artist => {
            return (
              <div key={artist.id} id='Card' className='w-60 h-80 flex flex-col justify-center items-center bg-blue-300 mx-4'>
                <h1>Name : {artist.name}</h1>
                <h2>ID: {artist.id}</h2>
                <p>Followers: {artist.followers.total}</p>
              </div>
            )
          })
        }
      </div> */}
      
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

      <Modal isOpen = {modalOpen}>
        <div id='searchResults' className='flex flex-col max-w-screen overflow-scroll justify-center'>
          <button className='h-12 w-24 rounded-xl text-center bg-spotifyGreen' onClick={modalHandler}>
            Close
          </button>
          {
            artistList?.map(artist => {
              return (
                <div key={artist.id} id='Card' className='w-full h-40 flex flex-col justify-center bg-blue-300 my-2'>
                  <h1>Name : {artist.name}</h1>
                  <h2>ID: {artist.id}</h2>
                  <p>Followers: {artist.followers.total}</p>
                </div>
              )
            })
          }
        </div>
      </Modal>
    </div> 
  )
}

