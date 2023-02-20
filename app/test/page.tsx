'use client'
import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { TextureLoader } from 'three/src/loaders/TextureLoader'
import { Suspense } from "react";
import { Physics, useCylinder, usePlane } from '@react-three/cannon'

const testData = [
  {artistName: 'Gallant', collabCount: 2},
  {artistName: 'Kendrick Lamar', collabCount: 5},
  {artistName: 'Jey Lato', collabCount: 3},
  {artistName: 'Ed Sheeran', collabCount: 9},
  {artistName: 'GUY', collabCount: 6},
  {artistName: 'Buffy', collabCount: 8},
  {artistName: 'Giles', collabCount: 4},
  {artistName: 'Cordelia', collabCount: 7},
  {artistName: 'Kenny G', collabCount: 1},
  {artistName: 'Reikland', collabCount: 3},
  {artistName: 'Lokhir Fellheart', collabCount: 5},
  {artistName: 'Sandy', collabCount: 10},
  {artistName: 'Thea', collabCount: 9},
  {artistName: 'Justin Bieber', collabCount: 2},
  {artistName: 'Drake', collabCount: 1},
  {artistName: 'Journey', collabCount: 5},
  {artistName: 'Edro', collabCount: 4},
  {artistName: 'YourMom', collabCount: 69},
] // 18 tests

const collabSum = testData.reduce(function(acc, collaborator){
  return acc + collaborator.collabCount
}, 0)

console.log(collabSum)

//React Fiber && THREE.js
function Cylinder({position, rotation}){
  const artistImage = useLoader(TextureLoader,'/test.png')
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
    <mesh ref={ref}>
      <cylinderGeometry args={[3,3,0.5]} />
      <meshStandardMaterial attach='material' color='#FFA500' map={artistImage} />
    </mesh>
  )
}

function Plane({position, rotation}){
  const [ref] = usePlane(() => (
    {
      mass: 10,
      type: 'Static',
      position: position,
      rotation: rotation
    }
  ));
  return(
    <mesh ref={ref}>
      <planeGeometry args={[10000,10000]} />
      <meshStandardMaterial attach='material' color ='#FFFFFF'/>
    </mesh>
  )
}

function CollabCoin({position, rotation, size}){
  const artistImage = useLoader(TextureLoader,'/test.png')
  const [ref] = useCylinder(() => (
    {
      mass: 10,
      position: position,
      rotation: rotation
    }
  ))
  //Radius, Height, Width
  return (
    <mesh ref={ref}>
      <cylinderGeometry args={[size,size,0.5]} />
      <meshStandardMaterial attach='material' color='#FFA500' map={artistImage} />
    </mesh>
  )
}

export default function page() {
  console.log(testData)
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
          <Physics>
            <Plane position={[0,0,0]} rotation={[-Math.PI / 2, 0, 0 ]} />
            <Cylinder position={[0,1,0]} rotation={[Math.PI, Math.PI / 2, 0]}/>
          {
            testData.map((collaborator, index) => {
              let coinSize:number = Math.round((collaborator.collabCount / collabSum) * testData.length) + 1
              let zPosition = index % 2 ? 6 : -6
              function xPositionCalc(index) {
                if(index % 2 == 0){
                  return index % 4 == 0 ? 4 : -4
                } else {
                  return index % 3 == 0 ? 4 : -4
                }
              }
              let xPosition = xPositionCalc(index)

              return(
                <CollabCoin key={index} position={[xPosition,10,zPosition]} rotation={[Math.PI, Math.PI / 2, 0]} size={coinSize} />
              )
            })
          }
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  )
}
