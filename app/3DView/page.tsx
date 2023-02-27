'use client'
import { Suspense, useEffect, useState } from "react";
import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import { useSearchParams } from 'next/navigation';
import { PacmanLoader } from 'react-spinners';
import { Physics, useCylinder, usePlane, useBox, Triplet } from '@react-three/cannon';
import Modal from 'react-modal';
import Image from 'next/image'
import * as THREE from 'three';


//React Fiber && THREE.js
function ArtistCoin({position, rotation, image} : {position: Triplet, rotation: Triplet, image: string}){
  const artistImage = useLoader(TextureLoader, image)
  const [ref] = useCylinder(() => (
    {
      mass: 0,
      type:'Static',
      position: position,
      rotation: rotation
    }
  ))
  //Radius, Height, Width
  return (
    //@ts-ignore
    <mesh ref={ref}>
      <cylinderGeometry args={[3,3,0.5]} />
      <meshStandardMaterial attach='material' map={artistImage} />
    </mesh>
  )
}

function Plane({position, rotation}: {position: Triplet, rotation: Triplet}){
  const [ref] = usePlane(() => (
    {
      mass: 10,
      type: 'Static',
      position: position,
      rotation: rotation
    }
  ));
  return(
    //@ts-ignore
    <mesh ref={ref}>
      <planeGeometry args={[10000,10000]} />
      <meshStandardMaterial attach='material' color ='#334155'/>
    </mesh>
  )
}

function CollabCoin({position, rotation, size, image}: {position: Triplet, rotation: Triplet, size: number, image:string}){
  const artistImage = useLoader(TextureLoader, image)
  const [ref] = useCylinder(() => (
    {
      mass: 10,
      position: position,
      rotation: rotation
    }
  ))
  return (
    //@ts-ignore
    <mesh ref={ref}>
      <cylinderGeometry args={[size,size,0.5]} />
      <meshStandardMaterial attach='material' map={artistImage} />
    </mesh>
  )
}

function CursorMove(){
  const [ref, api] = useBox(() => (
    {
      mass: 0,
      position: [0,0,0],
    }
  ))

  useFrame(({ camera, pointer, viewport }) => {
    let x = pointer.x * camera.position.y * viewport.width / 20
    let z =  pointer.y * -camera.position.y * viewport.height / 20
    const vector = new THREE.Vector3(x, 1, z);
    api.position.set(vector.x, vector.y, vector.z);
})

  return (
    //@ts-ignore
    <mesh ref={ref} position={[0,0,0]}>
      <coneGeometry args={[2,2,4]} />
      <meshStandardMaterial attach='material' visible={false} />
    </mesh>
  )
}

export default function page() {
  const axios = require('axios')
  const searchParams = useSearchParams();
  const [modalOpen, setModalOpen] = useState<Boolean>(false);
  let accessToken:string | null = searchParams.get('accessToken');
  let refreshToken:string | null = searchParams.get('refreshToken')
  let id:string | null = searchParams.get('id')

  const [artistName, setArtistName] = useState<string | null>();
  const [profilePicture, setProfilePicture] = useState<string | null>('');
  const [artistAlbums, setArtistAlbums] = useState<any[] | undefined>(undefined);
  const [artistCollabs, setArtistCollabs] = useState<any[] | undefined | null>(undefined);
  const [tempSorted, setTempSorted] = useState<any[] | undefined>(undefined);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [errorNum, setErrorNum] = useState<number>();

  function getArtist(){
    //Axios call using id to Spotify API --> set artist name and profile picture to state
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

  function getArtistAlbums(){
    // Axios call to get artist's album list --> remove duplicates --> sets album list to local stateg
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

  function getAlbumTracks(albums:any[]){
    // Axios call to get album tracks --> sends result into collab counter function
    let arr:any[] = []

    let getTracks = albums.map((album) => {
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

    Promise.all(getTracks)
      .then(result => {
        arr = result
        return "success"
      })
      .then(result => {
        collabCounter(arr)
      })
      .catch(err => {
        console.log(err)
      })
  }

  function collabCounter(albumList:any[]){
    // Grab list of artists per album --> count instances of artist in a map --> converts map to Array 
    // --> Sort array --> set sorted array in temp state
    const collaborators = new Map()

    class Collaborator {
      id: string;
      collabCount = 1

      constructor (id:string){
        this.id = id;
      }
    }

    albumList.forEach(album => {
      album.data.items.forEach(track => {
        if (track.artists.length > 1){
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
        }
      })
    })

    if (collaborators.size == 0){
      setArtistCollabs(null)
    } else {
      let mapConvert = Array.from(collaborators.entries(), function(collaborator) {
        return {key: collaborator[0], value: collaborator[1]}
      })
  
      let sortedList = mapConvert.sort((a,b) => a.value.collabCount < b.value.collabCount? 1 : -1)
      setTempSorted(sortedList);
    } 
  }

  function getCollaboratorImages(artistList:any[]){
    class Collaborator {
      id: string;
      name: string;
      collabs: number;
      image: string;
      href: string


      constructor (id:string, name:string, collabs:number, image:string, href:string){
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
        if(response.data.images[2]?.url){
          let collabArtist = new Collaborator(
            response.data.id, 
            response.data.name, 
            collabs, 
            response.data.images[2]?.url, 
            response.data.href
          )

          return collabArtist
        } else {
          let collabArtist = new Collaborator(
            response.data.id, 
            response.data.name, 
            collabs, 
            '', 
            response.data.href
          )
          return collabArtist
        }

      })
      .catch(err => {
        setErrorNum(err.status);
        setError('Error getting albums');
        setModalOpen(true);
      })
    })

    Promise.all(request)
      .then(response => {
        if (response.length == 0){
          setLoaded(true)
          setArtistCollabs([])
        } else {
          setArtistCollabs(response);
        }
      })
      .catch(err => {
        setErrorNum(err.status);
        setError('Error getting albums');
        setModalOpen(true);
      })
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
    return new Promise((resolve, reject) => {
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

  function homeRedirect(){
    if (refreshToken) {
      window.location.assign(`http://localhost:3000/home?accessToken=${accessToken}&refreshToken=${refreshToken}`)
    } else {
      window.location.assign(`http://localhost:3000/home?accessToken=${accessToken}`)
    }
  }

  function relog(){
    if(refreshToken){      
      window.location.assign(`http://localhost:8080/token?refreshToken=${refreshToken}`)
    } else {
      window.location.assign('http://localhost:3000/login')
    }

  }
  
  function artistRedirect(id:string){
    if (refreshToken){
      window.location.assign(`http://localhost:3000/artist?id=${id}&accessToken=${accessToken}&refreshToken=${refreshToken}`)
    } else {
      window.location.assign(`http://localhost:3000/artist?id=${id}&accessToken=${accessToken}`)
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
    getArtist()
  }, [])

  useEffect(()=> {
    if (artistName){
      getArtistAlbums()
    }
  }, [artistName])

  useEffect(() => {
    if (artistAlbums !== undefined){
      getAlbumTracks(artistAlbums)
    }
  }, [artistAlbums])

  useEffect(()=> {
    if (tempSorted !== undefined){
      getCollaboratorImages(tempSorted)
    }
  },[tempSorted])

  useEffect(() => {
    console.log(artistCollabs)
    let buffer = setTimeout(() => {
      setLoaded(true)
    }, 4000)

    return () => {
      clearTimeout(buffer)
    }

  }, [artistCollabs])


  if (!loaded){
    return (
      <div className='flex flex-col w-screen h-screen justify-center items-center bg-black text-white'>
        <PacmanLoader color='#1DB954'/>
        <h1>Loading...</h1>
      </div>
    )
  } else return (
    <div id='canvasContainer' className='flex flex-col w-screen h-screen'>
      <button className='absolute w-24 h-12 right-0 rounded-3xl text-xl bg-spotifyGreen text-black z-10 m-4' onClick={homeRedirect}>
        Back
      </button>
      <div id='collabList' className='absolute bottom-0 h-full w-3/12 bg-slate-200/[0.5] z-10'>
        <div id='collabListWrap' className='flex flex-col items-center h-full overflow-scroll'>
          <div className='flex flex-col w-full p-2'>
            <h1 className='text-2xl'>{artistName}</h1>
          </div>
          {
          artistCollabs && loaded ? 
          artistCollabs.map((collaborator) => {
            return (
              <button 
                key={collaborator.id}
                id='Card' 
                className='w-5/6 h-28 flex items-center bg-spotifyGreen p-2 m-2 rounded-xl hover:bg-white'
                onClick={() => artistRedirect(collaborator.id)}
              >
                <div className='flex items-center w-14 h-14 mx-2 bg-black rounded-full relative overflow-hidden'>
                  { collaborator.image &&
                    <Image
                      src={collaborator.image}
                      alt='spotify artist pic'
                      className='rounded-full'
                      width={56}
                      height={56}
                      object-fit='contain'
                      
                    />
                  }
                </div>
                <div className='flex flex-col items-end w-3/4'>
                  <h2 className='text-xl truncate'>{collaborator.name}</h2>
                  <p>Collab Count: {collaborator.collabs}</p>
                </div>
              </button>
              )
            })
          :
            <p>No collaborators found!</p>
          }
        </div>
      </div>

      <Canvas id='canvas' camera={{ fov: 75, near: 0.1, far: 1000, position: [0,10,0] }}>
        <color attach="background" args={['#1e293b']} />
        <ambientLight intensity={1}/>
        <OrbitControls maxPolarAngle={0} rotateSpeed={0} />
        <Suspense fallback={null}>
          <Physics>
            <Plane position={[0,0,0]} rotation={[-Math.PI / 2, 0, 0 ]} />
            <CursorMove />
            {
              profilePicture !== null ? 
                <ArtistCoin position={[0,1,0]} rotation={[Math.PI, Math.PI / 2, 0]} image={profilePicture} />
              :
              <></>
            }
            {
              artistCollabs ? 
                artistCollabs.map((collaborator:any) => {
                  let xPosition = THREE.MathUtils.randFloat(-6, 6)
                  let zPosition = THREE.MathUtils.randFloat(-6, 6)
                  let size = Math.round(collaborator.collabs * 2 / artistCollabs.length) + 1

                  if(collaborator.image == ''){
                    return (
                      <CollabCoin 
                        key={collaborator.id} 
                        position={[xPosition,10,zPosition]} 
                        rotation={[Math.PI, Math.PI / 2, 0]} 
                        size={size}
                        image='/default.png'
                      />
                    )
                  } else {
                    return (
                      <CollabCoin 
                        key={collaborator.id} 
                        position={[xPosition,10,zPosition]} 
                        rotation={[Math.PI, Math.PI / 2, 0]} 
                        size={size}
                        image={collaborator.image}
                      />
                    )
                  }
                })
              :
              <></>
            }
          </Physics>
        </Suspense>
      </Canvas>

      <Modal ariaHideApp={false} isOpen={modalOpen} style={modalStyle}>
        <div id='searchResults' className='flex flex-col max-w-screen overflow-scroll justify-center items-center text-center text-white bg-black'>
          <h2 className='text-2xl'>Uh oh! Something went wrong... 😓</h2>
          <p className='text-l'>Please log in again!</p>
          { errorNum &&
            <p className='text-sm'>Error Num: {errorNum}</p>
          }
          <p>{error}</p>
          <button onClick={relog} className='h-12 w-24 my-4 rounded-xl text-center bg-spotifyGreen'>
            Relog
          </button>
        </div>
      </Modal>
    </div>
  )
}
