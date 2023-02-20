'use client'
import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { TextureLoader } from 'three/src/loaders/TextureLoader'
import { Suspense } from "react";
import * as CANNON from 'cannon-es'

const testData = [{artistName: 'Gallant', collabCount: 2},
{artistName: 'Kendrick Lamar', collabCount: 5},
{artistName: 'Jey Lato', collabCount: 3},
{artistName: 'Ed Sheeran', collabCount: 9},
{artistName: 'GUY', collabCount: 6},
{artistName: 'Buffy', collabCount: 8},
{artistName: 'Giles', collabCount: 4}]


//React Fiber && THREE.js
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

//Cannon-es code
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
})

const groundBody = new CANNON.Body({
  type: CANNON.Body.STATIC,
  shape: new CANNON.Plane(),
})
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)

world.addBody(groundBody)

export default function page() {
  return (
    <div id='canvas-container' className='w-screen h-screen'>
      <Canvas camera={{ fov: 75, near: 0.1, far: 1000, position: [0,10,0] }}>
        <color attach="background" args={['#1e293b']} />
        <ambientLight intensity={1}/>
        <OrbitControls />
        <Suspense fallback={null}>
          <gridHelper args={[20,20, '#FF0000', '#FF0000']} />
          <gridHelper args={[20,20, '#00FF00', '#00FF00']} rotation={[0,0,Math.PI / 2]} />
          <gridHelper args={[20,20, '#0000FF', '#0000FF']} rotation={[Math.PI / 2,0,0]} />
          <Plane position={[0,0,0]} rotation={[-Math.PI / 2, 0, 0 ]} />
          {/* <Cylinder position={[0,1,0]} rotation={[Math.PI, Math.PI / 2, 0]}/> */}
        </Suspense>
      </Canvas>
    </div>
  )
}
