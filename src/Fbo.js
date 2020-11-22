import React, { useRef, useMemo, useCallback, useEffect } from 'react'
import { useThree } from 'react-three-fiber'
import {
  WebGLRenderTarget,
  NearestFilter,
  ShaderMaterial,
  DataTexture,
  RGBAFormat,
  FloatType,
  Scene,
  OrthographicCamera,
  BufferGeometry,
  BufferAttribute,
  Mesh,
  RGBFormat,
  PlaneBufferGeometry
} from 'three'
import { snoise } from './snoise'

const renderTargetProps = {
  minFilter: NearestFilter,
  magFilter: NearestFilter,
  format: RGBAFormat,
  type: FloatType,
  stencilBuffer: false,
  depthBuffer: false,
  depthWrite: false,
  depthTest: false
}

export default function useFbo({ width = 512, height = 512, uniforms, name = 'FBO', data, ...props } = {}) {
  const scene = useMemo(() => {
    return new Scene()
  }, [])

  const { size } = useThree()

  const camera = useMemo(() => new OrthographicCamera(-1, 1, 1, -1, 0, 1), [])

  const renderTarget = useMemo(() => {
    return [new WebGLRenderTarget(width, height, renderTargetProps), new WebGLRenderTarget(width, height, renderTargetProps)]
  }, [width, height])

  const positions = useMemo(() => {
    const t = new DataTexture(data, width, height, RGBFormat, FloatType)
    t.needsUpdate = true
    return t
  }, [width, height, data])

  const simulationMaterial = useMemo(() => {
    return new ShaderMaterial({
      name,
      defines: {
        RESOLUTION: `vec2(${size.width.toFixed(1)}, ${size.height.toFixed(1)})`
      },
      uniforms: {
        ...uniforms,
        time: {
          value: 0
        },
        oldPositions: {
          value: null
        },
        origin: {
          value: positions
        },
        positions: {
          value: positions
        }
      },
      vertexShader: `
        precision highp float;
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = vec4( position, 1.0 );
        }
      `,
      fragmentShader: `
        precision highp float;
        uniform sampler2D positions;
        uniform sampler2D oldPositions;
        uniform sampler2D origin;
        uniform float time;
        varying vec2 vUv;

        float rand(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453123);
        }

        ${snoise}

        void main() {
            vec4 pos = texture2D(positions, vUv );
            vec4 orig = texture2D(origin, vUv);

            float warp = snoise(pos.xyz*2.0+time*0.1)*0.0025;
            pos.xyz+=warp;
            //pos.y-=0.005;
            pos.z+=0.0015;

            if (rand(vUv+time)>0.997) {
              pos = orig;
            }

            gl_FragColor = pos;
        }
      `
    })
  }, [name, uniforms, positions, size.width, size.height])

  const quad = useMemo(() => {
    const vertices = new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0])

    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(vertices, 3))
    geometry.setAttribute('uv', new BufferAttribute(new Float32Array([0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0]), 2))

    return geometry
  }, [])

  let index = useRef(0)
  let copyData = useRef(true)

  const update = useCallback(
    ({ renderer, time }) => {
      const destIndex = index.current === 0 ? 1 : 0
      const old = renderTarget[index.current]
      const dest = renderTarget[destIndex]

      simulationMaterial.uniforms.positions.value = copyData.current ? positions : old.texture
      simulationMaterial.uniforms.oldPositions.value = dest.texture

      const prevTarget = renderer.getRenderTarget()

      renderer.setRenderTarget(dest)
      renderer.render(scene, camera)

      renderer.setRenderTarget(prevTarget)

      index.current = destIndex
      copyData.current = false

      simulationMaterial.uniforms.time.value = time
    },
    [renderTarget, positions, scene, camera, simulationMaterial]
  )

  useEffect(() => {
    const mesh = new Mesh(quad, simulationMaterial)
    mesh.frustumCulled = false
    scene.add(mesh)
  }, [scene, quad, simulationMaterial])

  return {
    renderTarget,
    texture: positions,
    material: simulationMaterial,
    scene,
    camera,
    quad,
    api: {
      update
    }
  }
}
