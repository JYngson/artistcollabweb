'use client'
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image'
import React from 'react';


export default function Artist() {
  const axios = require('axios')
  const searchParams = useSearchParams();
  let accessToken:string | null = searchParams.get('accessToken');
  let refreshToken:string | null = searchParams.get('refreshToken')
  let id:string | null = searchParams.get('id')

  let [artistName, setArtistName] = useState<string | null>();
  let [topGenres, setTopGenres] = useState<string[]>();
  let [spotifyLink, setSpotifyLink] = useState<string | null>();
  let [popularity, setPopularity] = useState<number>(0);
  let [followers, setFollowers] = useState<number>();
  let [profilePicture, setProfilePicture] = useState<string | null>();

  const getArtist = () => {
    axios({
      method: 'get',
      url: `https://api.spotify.com/v1/artists/${id}`,
      withCredentials: false,
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      }
    }).then(response => {
      setArtistName(response.data.name)
      setProfilePicture(response.data.images[1].url)
      setTopGenres(response.data.genres)
      setSpotifyLink(response.data.external_urls.spotify)
      setPopularity(response.data.popularity)
      setFollowers(response.data.followers.total);
      console.log(response)
    }).catch(err => {
      console.log(err)
    })
  }

  const searchRedirect = () => {
    if (refreshToken) {
      window.location.assign(`http://localhost:3000/home?accessToken=${accessToken}&refreshToken=${refreshToken}`)
    } else {
      window.location.assign(`http://localhost:3000/home?accessToken=${accessToken}`)
    }
    
  }

  useEffect(() => {
    getArtist()
  }, [])

  return (
    <div className='flex flex-col max-w-screen min-h-screen items-center justify-center overflow-scroll bg-gray-800'>
      { 
       profilePicture &&
        <Image
          src={profilePicture}
          alt='spotify artist pic'
          className='rounded-full mb-6 text-white'
          width={320}
          height={320}
        />
      }
      <h1 className='text-2xl mb-2 text-white'>{artistName}</h1>
      <h2 className='text-white'>Top Genres:</h2>
        <ul className='flex flex-row mb-2'>
          {
            topGenres?.map(genre => {
              return(
                <li className='text-white'> | {genre} | </li>
              )
            })
          }
        </ul>
      { spotifyLink && <a href={spotifyLink} className='mb-2 text-spotifyGreen'>Link to Spotify Page</a> }
      <p className='text-white'>Popularity - {popularity}</p>
      <p className='text-white'>Followers - {followers}</p>
      <button 
        onClick={searchRedirect} 
        className='h-12 w-24 m-2 rounded-xl text-center bg-spotifyGreen'>
          Back
      </button>
    </div>
  )
}

