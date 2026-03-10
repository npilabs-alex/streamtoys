/**
 * Shockwave distortion shader
 * Creates an expanding ring that distorts the image
 */

precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec2 uCenter;
uniform float uTime;
uniform float uAmplitude;
uniform float uWaveWidth;

void main() {
    vec2 uv = vTextureCoord;

    // Distance and direction from shockwave center
    vec2 dir = uv - uCenter;
    float dist = length(dir);

    // Ring shape - peaks at uTime distance from center
    float ring = smoothstep(uTime - uWaveWidth, uTime, dist)
               - smoothstep(uTime, uTime + uWaveWidth, dist);

    // Distort UVs along the ring
    vec2 offset = vec2(0.0);
    if (dist > 0.001) {
        offset = normalize(dir) * ring * uAmplitude * 0.03;
    }

    gl_FragColor = texture2D(uSampler, uv + offset);
}
