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
  let [followers, setFollowers] = useState<string>();
  let [profilePicture, setProfilePicture] = useState<string | null>();
  let [artistAlbums, setArtistAlbums] = useState<any[]>();


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
      followCountEdit(response.data.followers.total)
    }).catch(err => {
      console.log(err)
    })
  }

  const getAlbums = () => {
    axios({
      method: 'get',
      url: `https://api.spotify.com/v1/artists/${id}/albums`,
      withCredentials: false,
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      }
    }).then(response => {
      setArtistAlbums(response.data.items)
      console.log(response.data.items)
    }).catch(err => {
      console.log(err)
    })
  }

  const followCountEdit = (num:number) => {
      let stringConvert = num.toString().split("")
      if (num / 100000000 >= 1){
        stringConvert.splice(3,0, ',')
        stringConvert.splice(7,0, ',')
        setFollowers(stringConvert.join(''))
      } else if (num / 10000000 >=1){
        stringConvert.splice(2,0,',')
        stringConvert.splice(6,0, ',')
        setFollowers(stringConvert.join(''))
      } else if (num / 1000000 >=1){
        stringConvert.splice(1,0,',')
        stringConvert.splice(5,0,',')
        setFollowers(stringConvert.join(''))
      } else if (num / 100000 >=1){
        stringConvert.splice(3,0,',')
        setFollowers(stringConvert.join(''))
      } else if (num / 10000>=1){
        stringConvert.splice(2,0,',')
        setFollowers(stringConvert.join(''))
      } else if (num / 1000 >=1){
        stringConvert.splice(1,0,',')
        setFollowers(stringConvert.join(''))
      }
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
    getAlbums()
  }, [])

  return (
    <div className='flex flex-col w-screen items-center justify-center bg-gray-800'>
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
                <li className='text-white hover:text-spotifyGreen'> | {genre} | </li>
              )
            })
          }
        </ul>
      { spotifyLink && <a href={spotifyLink} className='mb-2 text-spotifyGreen'>Link to Spotify Page</a> }
      <p className='text-white'>Popularity - {popularity}</p>
      <p className='text-white'>Followers - {followers}</p>

      <div id='albumlist' className='flex overflow-scroll w-screen space-x-8 p-12'>
        {artistAlbums &&
          artistAlbums.map(album => {
            return(
              <div key={album.id} className='flex flex-col items-center'>
                { 
                  album.images[1] &&
                    <Image
                      src={album.images[1].url}
                      alt='spotify artist pic'
                      className='mb-6 text-white'
                      width={128}
                      height={128}
                  />
                }
                <div className='w-full'>
                  <h1 className='mb-2'>{album.name}</h1>
                  <p className='mb-2'>{album.type.toUpperCase()}</p>
                  <p className='mb-2'>Released: {album.release_date}</p>
                  <a href={album.href} className='text-spotifyGreen'>Link to Album</a>
                </div>
              </div>
            )
          })
        }
      </div>

      <button 
        onClick={searchRedirect} 
        className='h-12 w-24 m-2 rounded-xl text-center bg-spotifyGreen'>
          Back
      </button>
    </div>
  )
}

