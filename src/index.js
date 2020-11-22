import React, { Suspense, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { Canvas } from 'react-three-fiber'
import { OrbitControls, Text } from 'drei'
import Particles from './Particles'
import './styles.css'

function App() {
  const [clicked, setClicked] = useState(false)
  return (
    <Canvas
      onClick={() => {
        setClicked(true)
      }}
      concurrent
      pixelRatio={Math.min(2, devicePixelRatio)}
      gl={{ antialias: false }}
      camera={{ fov: 50, position: [0, 0, 6] }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000)
      }}>
      <Suspense fallback={null}>
        <Particles />
      </Suspense>
      {!clicked && (
        <Text color="#fff" fontSize={0.2} position={[0, -2.5, 0]}>
          Click to activate webcam
        </Text>
      )}
      <OrbitControls />
    </Canvas>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
