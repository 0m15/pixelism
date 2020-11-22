import React, { Suspense, useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { Canvas } from 'react-three-fiber'
import { OrbitControls, Text } from 'drei'
import Particles from './Particles'
import useRecorder from './recorder'
import './styles.css'

function Scene({ camera }) {
  const { start, stop, download } = useRecorder()

  useEffect(() => {
    if (camera === 'RECORDING') {
      start()
    }
    if (camera === 'END_RECORDING') {
      stop()
    }
    if (camera === 'DOWNLOADING') {
      download()
    }
  }, [camera, start, stop, download])

  return (
    <>
      <Suspense fallback={null}>
        <Particles />
      </Suspense>
      {camera === 'OFF' && (
        <Text color="#fff" fontSize={0.2} position={[0, -2.5, 0]}>
          Click to activate webcam
        </Text>
      )}
      {camera === 'STARTED' && (
        <Text color="#fff" fontSize={0.2} position={[0, -2.5, 0]}>
          Click to start recording
        </Text>
      )}
      {camera === 'RECORDING' && (
        <Text color="red" fontSize={0.2} position={[0, -2.5, 0]}>
          REC
        </Text>
      )}
      {camera === 'END_RECORDING' && (
        <Text fontSize={0.2} position={[0, -2.5, 0]}>
          Click to download video
        </Text>
      )}

      {/* <OrbitControls /> */}
    </>
  )
}

function App() {
  const [camera, setCamera] = useState('OFF')

  return (
    <Canvas
      onClick={() => {
        if (camera === 'OFF') setCamera('STARTED')
        if (camera === 'STARTED') setCamera('RECORDING')
        if (camera === 'RECORDING') {
          setCamera('END_RECORDING')
        }
        if (camera === 'END_RECORDING') {
          setCamera('DOWNLOADING')
          setTimeout(() => {
            setCamera('STARTED')
          }, 500)
        }
      }}
      concurrent
      pixelRatio={Math.min(2, devicePixelRatio)}
      gl={{ antialias: false }}
      camera={{ fov: 50, position: [0, 0, 6] }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000)
      }}>
      <Scene camera={camera} />
    </Canvas>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
