/**
 * Chromatic aberration shader
 * Separates RGB channels based on distance from center
 */

precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float uOffset;
uniform vec2 uCenter;

void main() {
    // Direction from center
    vec2 dir = vTextureCoord - uCenter;

    // Distance-based offset (stronger at edges)
    float d = length(dir) * uOffset * 0.01;

    // Sample RGB channels with different offsets
    vec4 color;
    color.r = texture2D(uSampler, vTextureCoord + dir * d).r;
    color.g = texture2D(uSampler, vTextureCoord).g;
    color.b = texture2D(uSampler, vTextureCoord - dir * d).b;
    color.a = 1.0;

    gl_FragColor = color;
}
