import { ShaderMaterial } from 'three'

export default class RenderShaderMaterial extends ShaderMaterial {
  constructor(props) {
    super({
      vertexShader: `
        uniform sampler2D positions;
        uniform float pointSize;
        varying vec2 vUv;

        vec2 screenspace(vec3 pos){
          vec3 temp = pos;
          temp.xy = (0.5)+(temp.xy)*0.5;
          return temp.xy;
        }

        void main() {
          vec3 pos = texture2D( positions, position.xy ).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
          gl_PointSize = pointSize;
          vUv = screenspace(pos);
        }
        `,
      fragmentShader: `
        uniform sampler2D map;
        varying vec2 vUv;
        
        void main() {
          vec2 uv=vUv;
          vec3 col = texture2D(map, uv).rgb;
          float bright = 0.33333 * (col.r + col.g + col.b);
          float b = mix(0.0, 1.0, step(0.5, bright));
          gl_FragColor = vec4(vec3(col), 1.0);
        }
        `,
      uniforms: {
        positions: { type: 't', value: null },
        pointSize: { type: 'f', value: 8 },
        map: { value: null }
      },
      transparent: true
      //blending: AdditiveBlending
    })
  }
}
