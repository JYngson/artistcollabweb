'use client'
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Image from 'next/image'
import BG from '../../images/SearchBG.jpg'

export default function AccessToken() {
  const searchParams = useSearchParams();
  const axios = require('axios')
  const [modalOpen, setModalOpen] = useState<Boolean>(false);

  let accessToken:string | null = searchParams.get('accessToken');
  let refreshToken:string | null = searchParams.get('refreshToken');
  let [artist, setArtist] = useState<String| null>();
  let [artistList, setArtistList] = useState<any[]>();
  let [modalMessage, setModalMessage] = useState<string>("Searching...")
  let [error, setError] = useState<boolean>(false)

  const artistPageRedirect = (id:string) => {
    if (refreshToken){
      window.location.assign(`http://localhost:3000/artist?id=${id}&accessToken=${accessToken}&refreshToken=${refreshToken}`)
    } else {
      window.location.assign(`http://localhost:3000/artist?id=${id}&accessToken=${accessToken}`)
    }
  }

  const relog = () => {
    window.location.assign('http://localhost:3000/login')
  }

  const modalHandler = () => {
    modalOpen === false ? setModalOpen(true) : setModalOpen(false)
  }

  const artistSearch = () => {
    setArtistList(undefined)

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
        response.data.artists.items.length == 0 ? 
        setModalMessage("No artist found under that name! ; - ;") 
        :
        setArtistList(response.data.artists.items),
        modalHandler()
    ).catch(err => {
        if(err.status == 401){
          if(refreshToken){
            window.location.assign(`http://localhost:8080/tokenRefresh?${refreshToken}`)
          } else {
            window.location.assign('http://localhost:3000/login')
          }
        } 
        else {setError(true)}
    })
  }

  const roundToThousand = (followers:number) => {
    let thousandCalc = Math.round(followers / 1000)
    let millionCalc = Math.round(followers / 1000000)

    if (followers < 1000){
      return followers
    } else if (followers > 1000000){
      return `${millionCalc}m`
    } else {
      return `${thousandCalc}k`
    }
  }

  const modalStyle = {
    overlay : {
      backgroundColor: '#000000',
      zIndex: 100
    },
    content: {
      background: '#000000',
      border: '2px solid #ccc',
    }
  }

  useEffect(() => {
    if (error) {
      setModalOpen(true)
    }
  }, [error])

  return (
    <div id='HomePage' className='flex flex-col relative max-w-screen h-screen justify-center items-center overflow-hidden bg-black'>
      <Image
        src={BG}
        alt='background image'
        className='absolute object-cover z-0 w-full h-full animate-fade-in'
      />
      <div id='search' className='my-4 flex flex-col w-5/12 h-2/6 justify-center items-center bg-zinc-800/[0.8] rounded-xl z-10'>
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
          onClick={artistSearch}>
            Search
        </button>

      </div>

      <Modal ariaHideApp={false} isOpen={modalOpen} style={modalStyle}>
        {
          error ? 
            <div id='errorModal' className='flex flex-col max-w-screen overflow-scroll justify-center items-center text-center bg-black'>
              <h1 className='text-3xl text-white'>Something went wrong! Please log in again.</h1>
              <button onClick={relog} className='h-12 w-24 my-4 rounded-xl text-center bg-spotifyGreen'>
                Redirect
              </button>
            </div>
          :
            <div id='searchResults' className='flex flex-col max-w-screen overflow-scroll justify-center items-center bg-black'>
              <button className='h-12 w-24 m-2 self-start rounded-xl text-center bg-spotifyGreen' onClick={modalHandler}>
                Close
              </button>
              { artistList? 
                  artistList.map(artist => {
                    return (
                      <button 
                        key={artist.id} 
                        id='Card' 
                        onClick={() => artistPageRedirect(artist.id)} 
                        className='w-2/6 h-40 flex items-center bg-spotifyGreen my-2 rounded-xl hover:bg-white'
                      >
                        { artist.images &&
                          <Image
                            src={artist?.images[2]?.url}
                            alt='spotify artist pic'
                            className='rounded-3xl mx-6'
                            width={100}
                            height={100}
                          />
                        }
                        <div className='flex flex-col w-full'>
                          <h1 className='text-xl'>{artist.name}</h1>
                          <p className='text-m'>Followers: {roundToThousand(artist.followers.total)}</p>
                        </div>
                      </button>
                    )
                  })
                :
                  <h1 className='text-white'>{modalMessage}</h1>
              }
            </div>      
        }
      </Modal>
    </div> 
  )
}