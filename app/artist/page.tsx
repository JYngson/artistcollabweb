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
  let [artistAlbums, setArtistAlbums] = useState<any[] | undefined>(undefined);
  let [artistCollabs, setArtistCollabs] = useState<any[]>();
  


  async function getArtist ()  {
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
      if(err.status == 401){
        if(err.message = 'The access token expired'){
          if(refreshToken){
            window.location.assign(`http://localhost:8080/tokenRefresh?${refreshToken}`)
          } else {
            window.location.assign('http://localhost:3000/login')
          }
        }
      }
    })
  }

  async function getAlbums(){
    axios({
      method: 'get',
      url: `https://api.spotify.com/v1/artists/${id}/albums`,
      withCredentials: false,
      params: {
        market: 'US'
      },
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      }
    }).then(response => {
      removeAlbumDuplicates(response.data.items)
    }).catch(err => {
      if (err instanceof TypeError == false){
        console.log(err)
      }
    })
  }

  function removeAlbumDuplicates (albums:any[]) {
    class Album {
      id: string;
      name: string
      type: string;
      image: string;
      spotifyLink: string;
      trackCount: number;
      releaseDate: string;
      artistFeatures: Array<{name:string, count:number}>

      constructor (id, name, type, image, spotifyLink, trackCount, releaseDate, artistFeatures){
        this.id = id;
        this.name = name;
        this.type = type;
        this.image = image;
        this.spotifyLink = spotifyLink;
        this.trackCount = trackCount;
        this.releaseDate = releaseDate;
        this.artistFeatures = artistFeatures;
      }
    }

    let albumList = new Map()

    albums.forEach(album => {
        if (!albumList.has(album.name)){
          const mapKey:string = album.name.replace(/ /g, "_")
          const newAlbum = new Album(
            album.id, 
            album.name, 
            album.type, 
            album.images[1], 
            album.external_urls.spotify, 
            album.total_tracks, 
            album.release_date,
            album.artists
          )
          albumList.set(mapKey, newAlbum)
        }
        let mapConvert = Array.from(albumList, function(mapAlbum) {
          return {key: mapAlbum[0], value: mapAlbum[1]}
        })

        setArtistAlbums(mapConvert)
    })
  }

  async function collabCount(artistAlbums){
    let collabList = new Map()

    class CollabArtist {
      id: string;
      name: string
      type: string;
      spotifyLink: string;
      image: string;
      collabCount = 1

      // getImage = () => {
      //   axios({
      //     method: 'get',
      //     url: `https://api.spotify.com/v1/artists/${id}`,
      //     withCredentials: false,
      //     headers: {
      //       'Authorization': 'Bearer ' + accessToken,
      //       'Content-Type': 'application/json'
      //     }
      //   }).then(response => {
      //     console.log(response)
      //     this.image = response.images[2]
      //   })
      // }

      constructor (id, name, type, spotifyLink){
        this.id = id;
        this.name = name;
        this.type = type;
        this.spotifyLink = spotifyLink;
      }
    }

    artistAlbums.forEach(album => {
      const albumID = album.value.id
      axios({
        method: 'get',
        url: `https://api.spotify.com/v1/albums/${albumID}/tracks`,
        withCredentials: false,
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'Content-Type': 'application/json'
        }
      }).then(track => {
        track.data.items.forEach(song => {
          song.artists.forEach(artist => {
            if(artist.name !== artistName){
              const mapKey:string = artist.name.replace(/ /g, "_")
              const newCollab = new CollabArtist(
                artist.id, 
                artist.name, 
                artist.type, 
                artist.href
              )
              if (!collabList.has(mapKey)){
                collabList.set(mapKey, newCollab)
              } else if (collabList.has(mapKey)) {
                let artist = collabList.get(mapKey)
                artist.collabCount++
              }
            }
          })

          let mapConvert = Array.from(collabList.entries(), function(collaborator) {
            return {key: collaborator[0], value: collaborator[1]}
          })

          setArtistCollabs(mapConvert)
        })
      }).catch(err => {
        console.log(err)
      })
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
  
  const log = () => {
    console.log(artistCollabs)
  }

  useEffect(() => {
    getArtist().then(response => getAlbums())
  }, [])

  // useEffect(() => {
  //   if (artistAlbums !== undefined){
  //     collabCount(artistAlbums)
  //   }
  // }, [artistAlbums])

  useEffect(() => {
    if (artistCollabs !== undefined){
      artistCollabs.sort((a,b) => a.value.collabCount < b.value.collabCount? 1 : -1)
    }

  }, [artistCollabs])

  return (
    <div className='flex flex-col w-screen items-center justify-center bg-gray-800 overflow-hidden no-scrollbar'>
      { 
       profilePicture &&
        <Image
          src={profilePicture}
          alt='spotify artist pic'
          className='rounded-full my-6 text-white'
          width={320}
          height={320}
        />
      }
      <h1 className='text-2xl mb-2 text-white'>{artistName}</h1>
      <h2 className='text-white'>Top Genres:</h2>
        <ul className='flex flex-row mb-2'>
          {
            topGenres?.map((genre,index) => {
              return(
                <li key={index} className='text-white hover:text-spotifyGreen'> | {genre} | </li>
              )
            })
          }
        </ul>
      { spotifyLink && <a href={spotifyLink} className='mb-2 text-spotifyGreen'>Link to Spotify Page</a> }
      <p className='text-white'>Popularity - {popularity}</p>
      <p className='text-white'>Followers - {followers}</p>

      <button 
        onClick={log} 
        className='h-12 w-24 my-8 rounded-xl text-center bg-spotifyGreen'>
          Log
      </button>

      <div id='albumlist' className='flex overflow-scroll w-screen space-x-8 p-12 no-scrollbar'>

        {artistAlbums &&
          artistAlbums.map(album => {
            return(
              <div key={album.key} className='flex flex-col items-center text-center shrink-0 w-56'>
                { 
                  album.value.image &&
                    <Image
                      src={album.value.image.url}
                      alt='spotify artist pic'
                      className='mb-6 text-white'
                      width={128}
                      height={128}
                    />
                }
                <div id='album' className='w-full text-white justify-between'>
                  <h1 id='albumName' className='mb-2  text-clip'>{album.value.name}</h1>
                  <p id='albumType' className='mb-2'>{album.value.type.toUpperCase()}</p>
                  <p id='albumReleaseDate' className='mb-2'>Released: {album.value.releaseDate}</p>
                  <a id='albumLink' href={album.value.spotifyLink} className='text-spotifyGreen'>Link to Album</a>
                </div>
              </div>
            )
          })
        }
      </div>

      <button 
        onClick={searchRedirect} 
        className='h-12 w-24 my-8 rounded-xl text-center bg-spotifyGreen'>
          Back
      </button>
    </div>
  )
}

