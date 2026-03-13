/**
 * Replicate MusicGen Client
 *
 * Uses Meta's MusicGen model via Replicate API.
 * https://replicate.com/meta/musicgen
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const config = require('./config');

class ReplicateClient {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.REPLICATE_API_TOKEN;
    this.mockMode = options.mockMode || !this.apiKey;
    this.baseUrl = 'api.replicate.com';
    this.modelVersion = '671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb';

    if (this.mockMode) {
      console.log('⚠️  Running in MOCK MODE - no API key provided');
      console.log('   Set REPLICATE_API_TOKEN environment variable for real generation');
    } else {
      console.log('🎵 Using Replicate (MusicGen)');
    }
  }

  /**
   * Generate music from a text prompt
   */
  async generate(prompt, options = {}) {
    if (this.mockMode) {
      return this.mockGenerate(prompt, options);
    }

    const payload = {
      version: this.modelVersion,
      input: {
        prompt: prompt,
        duration: Math.round(Math.min(options.duration || config.audio.durationSeconds, 30)),
        model_version: 'stereo-large',
        output_format: 'wav'  // WAV for better quality, convert to MP3 later
      }
    };

    try {
      const response = await this.request('POST', '/v1/predictions', payload);

      return {
        taskId: response.id,
        status: response.status === 'succeeded' ? 'completed' : 'pending',
        audioUrl: response.output
      };
    } catch (error) {
      throw new Error(`Generation failed: ${error.message}`);
    }
  }

  /**
   * Check generation status
   */
  async getStatus(taskId) {
    if (this.mockMode) {
      return this.mockStatus(taskId);
    }

    try {
      const response = await this.request('GET', `/v1/predictions/${taskId}`);

      const status = response.status?.toLowerCase();
      const isComplete = status === 'succeeded';
      const isFailed = status === 'failed' || status === 'canceled';

      // Calculate progress from logs if available
      let progress = 50;
      if (response.logs) {
        const match = response.logs.match(/(\d+)\s*\/\s*(\d+)/g);
        if (match && match.length > 0) {
          const last = match[match.length - 1];
          const [current, total] = last.split(/\s*\/\s*/).map(Number);
          progress = Math.round((current / total) * 100);
        }
      }
      if (isComplete) progress = 100;

      return {
        status: isComplete ? 'completed' : isFailed ? 'failed' : 'pending',
        progress: progress,
        audioUrl: response.output,
        error: response.error
      };
    } catch (error) {
      throw new Error(`Status check failed: ${error.message}`);
    }
  }

  /**
   * Wait for generation to complete
   */
  async waitForCompletion(taskId, onProgress = null) {
    const startTime = Date.now();
    const timeout = 120000; // 2 minutes
    const pollInterval = 2000; // 2 seconds

    while (Date.now() - startTime < timeout) {
      const status = await this.getStatus(taskId);

      if (onProgress) {
        onProgress(status);
      }

      if (status.status === 'completed') {
        return status;
      }

      if (status.status === 'failed') {
        throw new Error(`Generation failed: ${status.error || 'Unknown error'}`);
      }

      await this.sleep(pollInterval);
    }

    throw new Error('Generation timed out');
  }

  /**
   * Download audio file (WAV) and convert to high-quality MP3
   */
  async downloadAudio(url, outputPath) {
    if (this.mockMode) {
      return this.mockDownload(outputPath);
    }

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Download WAV first
    const wavPath = outputPath.replace(/\.mp3$/, '.wav');

    await new Promise((resolve, reject) => {
      const file = fs.createWriteStream(wavPath);

      const doDownload = (downloadUrl) => {
        const protocol = downloadUrl.startsWith('https') ? https : require('http');
        const urlObj = new URL(downloadUrl);

        const options = {
          hostname: urlObj.hostname,
          path: urlObj.pathname + urlObj.search,
          method: 'GET'
        };

        protocol.get(options, (response) => {
          if (response.statusCode === 302 || response.statusCode === 301) {
            doDownload(response.headers.location);
            return;
          }

          if (response.statusCode !== 200) {
            reject(new Error(`Download failed: ${response.statusCode}`));
            return;
          }

          response.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve(wavPath);
          });
        }).on('error', (err) => {
          fs.unlink(wavPath, () => {});
          reject(err);
        });
      };

      doDownload(url);
    });

    // Convert WAV to high-quality MP3 using ffmpeg
    const { execSync } = require('child_process');
    try {
      execSync(`/usr/bin/ffmpeg -y -i "${wavPath}" -codec:a libmp3lame -b:a 192k -ar 44100 "${outputPath}" 2>/dev/null`);
      // Remove WAV file after conversion
      fs.unlinkSync(wavPath);
    } catch (err) {
      // If ffmpeg fails, keep the WAV
      console.log(`      ⚠️  FFmpeg conversion failed, keeping WAV`);
      fs.renameSync(wavPath, outputPath.replace(/\.mp3$/, '.wav'));
    }

    return outputPath;
  }

  /**
   * HTTP request helper
   */
  async request(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.baseUrl,
        path: endpoint,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${this.apiKey}`,
          'Accept': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(body);
            if (res.statusCode >= 400) {
              reject(new Error(json.detail || json.error || `HTTP ${res.statusCode}`));
            } else {
              resolve(json);
            }
          } catch (e) {
            if (res.statusCode >= 400) {
              reject(new Error(`HTTP ${res.statusCode}: ${body.substring(0, 200)}`));
            } else {
              reject(new Error(`Invalid JSON: ${body.substring(0, 100)}`));
            }
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  // Mock methods
  async mockGenerate(prompt, options) {
    const taskId = `mock_replicate_${Date.now()}`;
    console.log(`   [MOCK] Task: ${taskId}`);
    console.log(`   [MOCK] Prompt: "${prompt.substring(0, 50)}..."`);
    return { taskId, status: 'pending' };
  }

  async mockStatus(taskId) {
    return {
      status: 'completed',
      progress: 100,
      audioUrl: `mock://${taskId}.mp3`,
      duration: config.audio.durationSeconds
    };
  }

  async mockDownload(outputPath) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const placeholderPath = outputPath.replace(/\.(mp3|ogg|wav)$/, '.placeholder.json');
    fs.writeFileSync(placeholderPath, JSON.stringify({
      type: 'placeholder',
      message: 'Replace with real audio from Replicate MusicGen',
      generatedAt: new Date().toISOString(),
      config: { bpm: config.audio.bpm, key: config.audio.key }
    }, null, 2));
    console.log(`   [MOCK] Created: ${path.basename(placeholderPath)}`);
    return placeholderPath;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = ReplicateClient;
