/**
 * Beatoven.ai API Client
 *
 * Direct integration with Beatoven's public API.
 * https://github.com/Beatoven/public-api
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const config = require('./config');

class BeatovenClient {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.BEATOVEN_API_KEY;
    this.baseUrl = 'public-api.beatoven.ai';
    this.mockMode = options.mockMode || !this.apiKey;

    if (this.mockMode) {
      console.log('⚠️  Running in MOCK MODE - no API key provided');
      console.log('   Set BEATOVEN_API_KEY environment variable for real generation');
    } else {
      console.log('🎵 Using Beatoven.ai API');
    }
  }

  /**
   * Generate a track from text prompt
   */
  async generate(prompt, options = {}) {
    if (this.mockMode) {
      return this.mockGenerate(prompt, options);
    }

    const duration = Math.round(options.duration || config.audio.durationSeconds);
    const fullPrompt = `${duration} seconds ${prompt}`;

    const payload = {
      prompt: { text: fullPrompt },
      format: options.format || 'mp3',
      looping: true // Better for game loops
    };

    try {
      const response = await this.request('POST', '/api/v1/tracks/compose', payload);
      return {
        taskId: response.task_id,
        trackId: response.track_id,
        status: 'pending'
      };
    } catch (error) {
      throw new Error(`Generation failed: ${error.message}`);
    }
  }

  /**
   * Check composition status
   */
  async getStatus(taskId) {
    if (this.mockMode) {
      return this.mockStatus(taskId);
    }

    try {
      const response = await this.request('GET', `/api/v1/tasks/${taskId}`);

      const isComplete = response.status === 'composed';
      const isFailed = response.status === 'failed' || response.status === 'error';

      return {
        status: isComplete ? 'completed' : isFailed ? 'failed' : 'pending',
        progress: isComplete ? 100 : 50,
        audioUrl: response.meta?.track_url,
        stems: response.meta?.stems_url,
        error: response.error
      };
    } catch (error) {
      throw new Error(`Status check failed: ${error.message}`);
    }
  }

  /**
   * Wait for composition to complete
   */
  async waitForCompletion(taskId, onProgress = null) {
    const startTime = Date.now();
    const timeout = 300000; // 5 minutes
    const pollInterval = 5000; // 5 seconds

    while (Date.now() - startTime < timeout) {
      const status = await this.getStatus(taskId);

      if (onProgress) {
        onProgress(status);
      }

      if (status.status === 'completed') {
        return status;
      }

      if (status.status === 'failed') {
        throw new Error(`Composition failed: ${status.error || 'Unknown error'}`);
      }

      await this.sleep(pollInterval);
    }

    throw new Error('Composition timed out');
  }

  /**
   * Download audio file
   */
  async downloadAudio(url, outputPath) {
    if (this.mockMode) {
      return this.mockDownload(outputPath);
    }

    return new Promise((resolve, reject) => {
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const file = fs.createWriteStream(outputPath);

      https.get(url, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          this.downloadAudio(response.headers.location, outputPath)
            .then(resolve)
            .catch(reject);
          return;
        }

        if (response.statusCode !== 200) {
          reject(new Error(`Download failed: ${response.statusCode}`));
          return;
        }

        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(outputPath);
        });
      }).on('error', (err) => {
        fs.unlink(outputPath, () => {});
        reject(err);
      });
    });
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
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
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
              reject(new Error(json.message || json.error || `HTTP ${res.statusCode}`));
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
  async mockGenerate(prompt) {
    const taskId = `mock_beatoven_${Date.now()}`;
    console.log(`   [MOCK] Task: ${taskId}`);
    return { taskId, status: 'pending' };
  }

  async mockStatus(taskId) {
    return { status: 'completed', progress: 100, audioUrl: `mock://${taskId}.mp3` };
  }

  async mockDownload(outputPath) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const placeholderPath = outputPath.replace(/\.(mp3|ogg|wav)$/, '.placeholder.json');
    fs.writeFileSync(placeholderPath, JSON.stringify({ type: 'placeholder', config: { bpm: config.audio.bpm } }, null, 2));
    console.log(`   [MOCK] Created: ${path.basename(placeholderPath)}`);
    return placeholderPath;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = BeatovenClient;
