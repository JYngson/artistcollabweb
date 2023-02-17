'use client'
import * as THREE from "three";
import { Canvas, useLoader } from '@react-three/fiber'
import { PerspectiveCamera, OrbitControls } from '@react-three/drei'
import { TextureLoader } from 'three/src/loaders/TextureLoader'
import { Suspense } from "react";


function Cylinder(props){
  const artistImage = useLoader(TextureLoader,'/test.png')
  //Radius, Height, Width
  return (
    <mesh {...props}>
      <cylinderGeometry args={[2,2,0.5]} />
      <meshStandardMaterial attach='material' color='#FFA500' map={artistImage} />
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
