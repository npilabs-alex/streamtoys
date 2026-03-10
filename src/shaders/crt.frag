/**
 * CRT scanline effect shader
 */

precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float uScanlineIntensity;
uniform float uTime;
uniform vec2 uResolution;

void main() {
    vec4 color = texture2D(uSampler, vTextureCoord);

    // Scanlines - horizontal lines that darken every other row
    float scanline = sin(vTextureCoord.y * uResolution.y * 1.5) * 0.5 + 0.5;
    float scanlineEffect = 1.0 - uScanlineIntensity * (1.0 - scanline);

    color.rgb *= scanlineEffect;

    // Subtle RGB shift on scanlines
    float shift = (1.0 - scanline) * 0.001;
    color.r = texture2D(uSampler, vTextureCoord + vec2(shift, 0.0)).r * scanlineEffect;
    color.b = texture2D(uSampler, vTextureCoord - vec2(shift, 0.0)).b * scanlineEffect;

    // Vignette - darken edges
    vec2 uv = vTextureCoord * 2.0 - 1.0;
    float vignette = 1.0 - dot(uv, uv) * 0.15;
    color.rgb *= vignette;

    // Subtle flicker
    float flicker = 0.99 + sin(uTime * 15.0) * 0.01;
    color.rgb *= flicker;

    gl_FragColor = color;
}
