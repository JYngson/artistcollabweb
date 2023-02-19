'use client'
import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { TextureLoader } from 'three/src/loaders/TextureLoader'
import { Suspense } from "react";

const testData = [{artistName: 'Gallant', collabCount: 2},
{artistName: 'Kendrick Lamar', collabCount: 5},
{artistName: 'Jey Lato', collabCount: 3},
{artistName: 'Ed Sheeran', collabCount: 9},
{artistName: 'GUY', collabCount: 6},
{artistName: 'Buffy', collabCount: 8},
{artistName: 'Giles', collabCount: 4}]


function Cylinder(props){
  const artistImage = useLoader(TextureLoader,'/test.png')
  //Radius, Height, Width
  return (
    <mesh {...props}>
      <cylinderGeometry args={[2,2,0.5]} />
      <meshStandardMaterial attach='material' color='#FFA500' map={artistImage} />
      <Text position={[3,0,0]} color='red' rotation={[Math.PI / 2, 0 , Math.PI / 2]}>Artist Names</Text>
      <Text position={[4,0,0]} color='blue' rotation={[Math.PI / 2, 0 , Math.PI / 2]}>Collaborations: 2</Text>
    </mesh>
  )
}

function Plane(props){
  //Width, Height
  return(
    <mesh {...props}>
      <planeGeometry args={[30,30]} />
      <meshStandardMaterial attach='material' color ='#FFFFFF'/>
    </mesh>
  )
}


export default function page() {
  return (
    <div id='canvas-container' className='w-screen h-screen'>
      <Canvas camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 0, 15] }}>
        <color attach="background" args={['#1e293b']} />
        <ambientLight intensity={0.5}/>
        <spotLight color='white' intensity={0.5} position={[0,0,5]} />
        {/* <PerspectiveCamera /> */}
        <OrbitControls />
        <Suspense fallback={null}>
          <Plane position={[0,0,0]} />
          <Cylinder position={[0,0,1]} rotation={[-Math.PI / 2, Math.PI / 2, 0]}/>
        </Suspense>
      </Canvas>
    </div>
  )
}
