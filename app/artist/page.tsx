'use client'
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PacmanLoader } from 'react-spinners';
import Modal from 'react-modal';
import Image from 'next/image'
import React from 'react';

export default function Artist() {
  const axios = require('axios')
  const searchParams = useSearchParams();
  const [modalOpen, setModalOpen] = useState<Boolean>(false);
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
  let [artistCollabs, setArtistCollabs] = useState<any[] | undefined>(undefined);
  let [tempSorted, setTempSorted] = useState<any[] | undefined>(undefined)
  let [loaded, setLoaded] = useState<boolean>(false)
  let [error, setError] = useState<string | null>(null)
  let [errorNum, setErrorNum] = useState<number>()

  function getArtist(){
    return axios({
      method: 'get',
      url: `https://api.spotify.com/v1/artists/${id}`,
      withCredentials: false,
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      }
    })
    .then(artist => {
      setArtistName(artist.data.name)
      setProfilePicture(artist.data.images[1].url)
      setTopGenres(artist.data.genres)
      setSpotifyLink(artist.data.external_urls.spotify)
      setPopularity(artist.data.popularity)
      followCountEdit(artist.data.followers.total)
      return artist
    })
    .catch(err => {
      if(err.status == 401){
        if(refreshToken){
          window.location.assign(`http://localhost:8080/tokenRefresh?${refreshToken}`)
        } else {
          window.location.assign('http://localhost:3000/login')
        }
      } else {
        setErrorNum(err.status)
        setError('Error getting artist')
        setModalOpen(true)
      }
    })
  }

  function getAlbums(){
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
    })
    .then(albums => {
      return removeAlbumDuplicates(albums.data.items)
    })
    .then(albumList => {
      setArtistAlbums(albumList)
    })
    .catch(err => {
      setErrorNum(err.status);
      setError('Error getting albums');
      setModalOpen(true);
    })
  }

  function getCollaborators(albums:any[]){
    let arr:any[] = []
    let request = albums.map((album) => {
      let albumID = album.value.id
       return axios({
        method: 'get',
        url: `https://api.spotify.com/v1/albums/${albumID}/tracks`,
        withCredentials: false,
        params: {
          market: 'US'
        },
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'Content-Type': 'application/json'
        }
      })
      .then(tracks => {
        return tracks
      })
      .catch(err => {
        setErrorNum(err.status);
        setError('Error getting collaborators');
        setModalOpen(true);
      })
    })

    Promise.all(request)
      .then(result => {
        arr = result
        return "success"
      })
      .then(result => {
        console.log(result)
        collabCounter(arr)
      })
      .catch(err => {
        console.log(err)
      })
  }

  function getCollaboratorImages(artistList:any[]){
    class Collaborator {
      id: string;
      name: string;
      collabs: number;
      image: string;
      href: string


      constructor (id,name, collabs, image, href){
        this.id = id;
        this.name= name;
        this.collabs = collabs;
        this.image = image;
        this.href = href
      }
    }

    let request = artistList.map(artist => {
      let artistID = artist.value.id
      let collabs = artist.value.collabCount
      return axios({
        method: 'get',
        url: `https://api.spotify.com/v1/artists/${artistID}`,
        withCredentials: false,
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        let collabArtist = new Collaborator(
          response.data.id, 
          response.data.name, 
          collabs, 
          response.data.images[2]?.url, 
          response.data.href
        )
        return collabArtist
      })
      .catch(err => {
        setErrorNum(err.status);
        setError('Error getting albums');
        setModalOpen(true);
      })
    })

    Promise.all(request)
      .then(response => {
        setArtistCollabs(response);
      })
      .catch(err => {
        setErrorNum(err.status);
        setError('Error getting albums');
        setModalOpen(true);
      })
  }

  function collabCounter(albumList:any[]){
    const collaborators = new Map()

    class Collaborator {
      id: string;
      collabCount = 1

      constructor (id){
        this.id = id;
      }
    }

    albumList.forEach(album => {
      album.data.items.forEach(track => {
        track.artists.forEach(artist => {
          if(artist.name !== artistName){
            const mapKey:string = artist.name.replace(/ /g, "_")
            const newCollab = new Collaborator(
              artist.id, 
            )
            if (!collaborators.has(mapKey)){
              collaborators.set(mapKey, newCollab)
            } else if (collaborators.has(mapKey)) {
              let artist = collaborators.get(mapKey)
              artist.collabCount++
            }
          }
        })
      })
    })

    let mapConvert = Array.from(collaborators.entries(), function(collaborator) {
      return {key: collaborator[0], value: collaborator[1]}
    })

    let sortedList = mapConvert.sort((a,b) => a.value.collabCount < b.value.collabCount? 1 : -1)

    setTempSorted(sortedList);
  } 

  function removeAlbumDuplicates(albums:any[]){
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
    return new Promise((resolve, reject)=> {
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
      })

      let mapConvert = Array.from(albumList, function(mapAlbum) {
        return {key: mapAlbum[0], value: mapAlbum[1]}
      })
      resolve(mapConvert)
    })
  }

  function followCountEdit(num:number){
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

  function searchRedirect(){
    if (refreshToken) {
      window.location.assign(`http://localhost:3000/home?accessToken=${accessToken}&refreshToken=${refreshToken}`)
    } else {
      window.location.assign(`http://localhost:3000/home?accessToken=${accessToken}`)
    }
    
  }

  function relog(){
    window.location.assign('http://localhost:3000/login')
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
    getArtist()
  }, [])

  useEffect(()=> {
    if (artistName){
      getAlbums()
    }
  }, [artistName])

  useEffect(() => {
    if (artistAlbums !== undefined){
      getCollaborators(artistAlbums)
    }
  }, [artistAlbums])

  useEffect(()=> {
    if (tempSorted !== undefined){
      getCollaboratorImages(tempSorted)
    }
  },[tempSorted])

  useEffect(() => {
    if(artistCollabs !== undefined){
      setLoaded(true)
    }
  }, [artistCollabs])

  if (!loaded) {
    return (
      <div className='flex flex-col w-screen h-screen justify-center items-center bg-black text-white'>
        <PacmanLoader color='#1DB954'/>
        <h1>Loading...</h1>
      </div>
    )
  } else return (
      <div className='flex flex-col w-screen text-white items-center justify-center bg-gray-800 overflow-hidden no-scrollbar animate-fade-in'>
        { 
        profilePicture &&
          <Image
            src={profilePicture}
            alt='spotify artist pic'
            className='rounded-full my-6'
            width={320}
            height={320}
          />
        }
        <h1 className='text-2xl mb-2'>{artistName}</h1>
        <h2>Top Genres:</h2>
          <ul className='flex flex-row mb-2'>
            {
              topGenres?.map((genre,index) => {
                return(
                  <li key={index} className='mx-2 hover:text-spotifyGreen'>{genre}</li>
                )
              })
            }
          </ul>
        { spotifyLink && 
          <a href={spotifyLink} className='mb-2 text-spotifyGreen'>
            Link to Spotify Page
          </a> 
        }
        <p>Popularity - {popularity}</p>
        <p>Followers - {followers}</p>

        <div id='albumlist' className='flex overflow-scroll w-screen space-x-8 p-12 no-scrollbar'>
          { artistAlbums &&
              artistAlbums.map(album => {
                return(
                  <div key={album.key} className='flex flex-col items-center text-center shrink-0 w-56'>
                    { 
                      album.value.image &&
                        <Image
                          src={album.value.image.url}
                          alt='spotify artist pic'
                          className='mb-6 '
                          width={128}
                          height={128}
                        />
                    }
                    <div id='album' className='w-full  justify-between'>
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
          
        <h2 className='text-3xl '>Collaborators</h2>

        <div id='collablist' className='flex overflow-scroll w-screen space-x-8 p-12 no-scrollbar'>
          { artistCollabs && loaded &&
              artistCollabs.map(artist => {
                return (
                  <div key={artist.id} className='flex flex-col items-center text-center shrink-0 w-56'>
                    { 
                      artist.image &&
                        <Image
                          src={artist.image}
                          alt='spotify artist pic'
                          className='rounded-full my-6 '
                          width={100}
                          height={100}
                          priority
                        />
                    }
                    <h2 className='text-xl mb-2 '>{artist.name}</h2>
                    <a href={artist.href} className='mb-2 text-spotifyGreen'>Spotify</a>
                    <p>Collab Count:</p>
                    <p className='text-spotifyGreen'>{artist.collabs}</p>
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


        <Modal ariaHideApp={false} isOpen={modalOpen} style={modalStyle}>
          <div id='searchResults' className='flex flex-col max-w-screen overflow-scroll justify-center items-center text-center  bg-black'>
            <h2 className='text-2xl'>Uh oh! Something went wrong... 😓</h2>
            <p className='text-l'>Please log in again!</p>
            { errorNum &&
              <p className='text-sm'>Error Num: {errorNum}</p>
            }
            <p>{error}</p>
            <button onClick={relog} className='h-12 w-24 my-4 rounded-xl text-center bg-spotifyGreen'>
              Redirect
            </button>
          </div>
        </Modal>
      </div>
  )
}

