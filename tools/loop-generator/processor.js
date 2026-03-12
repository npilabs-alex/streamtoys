/**
 * Audio Processor
 *
 * Post-processes generated loops:
 * - Normalize BPM using time stretching
 * - Convert to required formats (ogg, mp3)
 * - Normalize loudness
 * - Trim to exact bar length
 *
 * Requires ffmpeg to be installed for audio processing.
 */

const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('./config');

class AudioProcessor {
  constructor() {
    this.ffmpegAvailable = this.checkFfmpeg();
    this.targetBpm = config.audio.bpm;
    this.targetDuration = config.audio.durationSeconds;
  }

  /**
   * Check if ffmpeg is available
   */
  checkFfmpeg() {
    try {
      execSync('ffmpeg -version', { stdio: 'ignore' });
      return true;
    } catch {
      console.warn('⚠️  ffmpeg not found - audio processing disabled');
      console.warn('   Install ffmpeg for BPM normalization and format conversion');
      return false;
    }
  }

  /**
   * Process a single audio file
   */
  async process(inputPath, options = {}) {
    if (!this.ffmpegAvailable) {
      throw new Error('ffmpeg is required for audio processing');
    }

    const sourceBpm = options.sourceBpm || this.targetBpm;
    const outputFormats = options.formats || config.output.formats;

    console.log(`   🔧 Processing: ${path.basename(inputPath)}`);

    // Calculate time stretch ratio if BPM differs
    const stretchRatio = sourceBpm / this.targetBpm;
    const needsStretch = Math.abs(stretchRatio - 1.0) > 0.01;

    const results = [];

    for (const format of outputFormats) {
      const outputPath = inputPath.replace(/\.[^.]+$/, `.${format}`);

      if (needsStretch) {
        console.log(`      Stretching from ${sourceBpm} to ${this.targetBpm} BPM...`);
        await this.timeStretch(inputPath, outputPath, stretchRatio, format);
      } else {
        await this.convert(inputPath, outputPath, format);
      }

      // Trim to exact duration
      await this.trimToLength(outputPath, this.targetDuration);

      // Normalize loudness
      await this.normalizeLoudness(outputPath);

      console.log(`      ✅ ${format.toUpperCase()}: ${path.basename(outputPath)}`);
      results.push(outputPath);
    }

    return results;
  }

  /**
   * Time stretch audio to match target BPM
   */
  async timeStretch(input, output, ratio, format) {
    return new Promise((resolve, reject) => {
      // Use rubberband filter for high-quality time stretching
      const codecArgs = this.getCodecArgs(format);
      const cmd = `ffmpeg -y -i "${input}" -filter:a "atempo=${ratio}" ${codecArgs} "${output}"`;

      exec(cmd, (error, stdout, stderr) => {
        if (error) reject(new Error(stderr || error.message));
        else resolve(output);
      });
    });
  }

  /**
   * Convert audio to specified format
   */
  async convert(input, output, format) {
    return new Promise((resolve, reject) => {
      const codecArgs = this.getCodecArgs(format);
      const cmd = `ffmpeg -y -i "${input}" ${codecArgs} "${output}"`;

      exec(cmd, (error, stdout, stderr) => {
        if (error) reject(new Error(stderr || error.message));
        else resolve(output);
      });
    });
  }

  /**
   * Trim audio to exact duration
   */
  async trimToLength(filePath, duration) {
    return new Promise((resolve, reject) => {
      const tempPath = filePath + '.temp' + path.extname(filePath);
      const cmd = `ffmpeg -y -i "${filePath}" -t ${duration} -c copy "${tempPath}" && mv "${tempPath}" "${filePath}"`;

      exec(cmd, { shell: true }, (error, stdout, stderr) => {
        if (error) reject(new Error(stderr || error.message));
        else resolve(filePath);
      });
    });
  }

  /**
   * Normalize audio loudness to -14 LUFS (streaming standard)
   */
  async normalizeLoudness(filePath, targetLufs = -14) {
    return new Promise((resolve, reject) => {
      const tempPath = filePath + '.norm' + path.extname(filePath);
      const cmd = `ffmpeg -y -i "${filePath}" -af "loudnorm=I=${targetLufs}:TP=-1.5:LRA=11" "${tempPath}" && mv "${tempPath}" "${filePath}"`;

      exec(cmd, { shell: true }, (error, stdout, stderr) => {
        if (error) reject(new Error(stderr || error.message));
        else resolve(filePath);
      });
    });
  }

  /**
   * Get codec arguments for format
   */
  getCodecArgs(format) {
    switch (format) {
      case 'ogg':
        return '-c:a libvorbis -q:a 6'; // Quality 6 = ~192kbps
      case 'mp3':
        return '-c:a libmp3lame -q:a 2'; // Quality 2 = ~190kbps
      case 'wav':
        return '-c:a pcm_s16le';
      case 'm4a':
        return '-c:a aac -b:a 192k';
      default:
        return '-c:a copy';
    }
  }

  /**
   * Detect BPM of audio file using ffmpeg/aubio
   */
  async detectBpm(filePath) {
    // Try aubio first (more accurate)
    try {
      const result = execSync(`aubio tempo "${filePath}"`, { encoding: 'utf8' });
      const bpm = parseFloat(result.trim());
      if (!isNaN(bpm)) return bpm;
    } catch {
      // aubio not available, fall back to estimation
    }

    // Fallback: assume target BPM (Suno should generate at requested BPM)
    console.log('      ⚠️  BPM detection not available, assuming target BPM');
    return this.targetBpm;
  }

  /**
   * Process all files in a directory
   */
  async processDirectory(dirPath, options = {}) {
    const files = fs.readdirSync(dirPath).filter(f =>
      ['.mp3', '.wav', '.ogg', '.m4a'].includes(path.extname(f).toLowerCase())
    );

    console.log(`\n🔧 Processing ${files.length} audio files in ${path.basename(dirPath)}`);

    const results = [];
    for (const file of files) {
      try {
        const result = await this.process(path.join(dirPath, file), options);
        results.push(...result);
      } catch (error) {
        console.log(`      ❌ Failed: ${file} - ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Validate audio file meets requirements
   */
  async validate(filePath) {
    return new Promise((resolve, reject) => {
      const cmd = `ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`;

      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          reject(new Error('Could not read audio file'));
          return;
        }

        try {
          const info = JSON.parse(stdout);
          const audio = info.streams.find(s => s.codec_type === 'audio');
          const duration = parseFloat(info.format.duration);

          const validation = {
            valid: true,
            duration,
            sampleRate: parseInt(audio.sample_rate),
            channels: audio.channels,
            codec: audio.codec_name,
            issues: []
          };

          // Check duration
          const expectedDuration = this.targetDuration;
          if (Math.abs(duration - expectedDuration) > 0.5) {
            validation.issues.push(`Duration ${duration.toFixed(2)}s != expected ${expectedDuration.toFixed(2)}s`);
          }

          // Check sample rate
          if (validation.sampleRate !== config.audio.sampleRate) {
            validation.issues.push(`Sample rate ${validation.sampleRate} != ${config.audio.sampleRate}`);
          }

          validation.valid = validation.issues.length === 0;
          resolve(validation);
        } catch (e) {
          reject(new Error('Could not parse audio info'));
        }
      });
    });
  }
}

module.exports = AudioProcessor;
