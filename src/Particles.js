import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from 'react-three-fiber'
import { BufferGeometry, BufferAttribute, DoubleSide } from 'three'
import useFbo from './Fbo'
import RenderShaderMaterial from './ParticlesMaterial'
import useWebcamTexture from './webcam'
const BUFFER_SIZE = 512

function getRandomPoints(count) {
  var vertices = new Float32Array(count * 3)

  for (var i = 0; i < count; i++) {
    var i3 = i * 3
    vertices[i3] = Math.random() * 2 - 1
    vertices[i3 + 1] = Math.random() * 2 - 1
    vertices[i3 + 2] = Math.random() * 2 - 1
  }

  return vertices
}

const data = getRandomPoints(BUFFER_SIZE * BUFFER_SIZE)

export default function FboParticles() {
  const points = useRef()
  const scroll = useRef(0)
  const renderMaterial = useMemo(() => new RenderShaderMaterial(), [])
  const map = useWebcamTexture()

  const { gl } = useThree()

  const { api: fbo, renderTarget } = useFbo({
    width: BUFFER_SIZE,
    height: BUFFER_SIZE,
    data
  })

  const particlesGeometry = useMemo(() => {
    const temp = new BufferGeometry()
    temp.setAttribute('position', new BufferAttribute(data, 3))
    return temp
  }, [])

  useEffect(() => {
    window.addEventListener('mousewheel', (evt) => {
      scroll.current += evt.deltaY
    })
  }, [])

  useFrame(({ clock, mouse, camera }) => {
    points.current.material.uniforms.positions.value = renderTarget[0].texture
    points.current.material.uniforms.map.value = map

    // update particles positions
    fbo.update({ renderer: gl, time: clock.getElapsedTime() })
  })

  return (
    <group>
      <mesh rotation={[0, 0, 0]} position={[0, 0, 0]}>
        <planeBufferGeometry args={[3, 3]} attach="geometry" />
        <meshBasicMaterial transparent opacity={0.95} side={DoubleSide} map={map} attach="material" />
      </mesh>
      <points ref={points} position={[0, 0, 0]}>
        <primitive object={particlesGeometry} attach="geometry" />
        <primitive object={renderMaterial} attach="material" />
      </points>
    </group>
  )
}
