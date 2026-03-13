/**
 * fal.ai Client for Beatoven Music Generation
 *
 * Uses fal.ai's hosted Beatoven model for music generation.
 * https://fal.ai/models/beatoven/music-generation
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const config = require('./config');

class FalClient {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.FAL_KEY;
    this.mockMode = options.mockMode || !this.apiKey;
    this.baseUrl = 'fal.run';
    this.model = 'beatoven/music-generation';

    if (this.mockMode) {
      console.log('⚠️  Running in MOCK MODE - no API key provided');
      console.log('   Set FAL_KEY environment variable for real generation');
      console.log('   Get your key at: https://fal.ai/dashboard/keys');
    } else {
      console.log('🎵 Using fal.ai (Beatoven)');
    }
  }

  /**
   * Generate music from a text prompt (synchronous - Beatoven returns directly)
   */
  async generate(prompt, options = {}) {
    if (this.mockMode) {
      return this.mockGenerate(prompt, options);
    }

    const payload = {
      prompt: prompt,
      duration: Math.min(options.duration || config.audio.durationSeconds, 150),
      refinement: options.refinement || 120,
      creativity: options.creativity || 14,
      negative_prompt: options.negativePrompt || 'vocals, singing, voice'
    };

    try {
      // Beatoven returns audio directly (synchronous)
      const response = await this.request('POST', `/${this.model}`, payload);

      // Check if we got audio back directly
      if (response.audio?.url || response.url) {
        return {
          taskId: 'direct_' + Date.now(),
          status: 'completed',
          audioUrl: response.audio?.url || response.url,
          duration: response.duration
        };
      }

      // If async, return task ID for polling
      return {
        taskId: response.request_id || response.id,
        status: 'pending'
      };
    } catch (error) {
      throw new Error(`Generation failed: ${error.message}`);
    }
  }

  /**
   * Check generation status (for async requests)
   */
  async getStatus(taskId) {
    if (this.mockMode) {
      return this.mockStatus(taskId);
    }

    // If it was a direct response, already complete
    if (taskId.startsWith('direct_')) {
      return { status: 'completed', progress: 100 };
    }

    try {
      const response = await this.request('GET', `/requests/${taskId}/status`);

      const status = response.status?.toLowerCase();
      const isComplete = ['completed', 'succeeded'].includes(status);
      const isFailed = ['failed', 'error'].includes(status);

      let audioUrl = null;
      if (isComplete && response.audio?.url) {
        audioUrl = response.audio.url;
      }

      return {
        status: isComplete ? 'completed' : isFailed ? 'failed' : 'pending',
        progress: response.progress || (isComplete ? 100 : 50),
        audioUrl: audioUrl,
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
    // Check if already complete (direct response)
    if (taskId.startsWith('direct_')) {
      return { status: 'completed', progress: 100 };
    }

    const startTime = Date.now();
    const timeout = 180000; // 3 minutes
    const pollInterval = 3000; // 3 seconds

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
          'Content-Type': 'application/json',
          'Authorization': `Key ${this.apiKey}`,
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
    const taskId = `mock_fal_${Date.now()}`;
    console.log(`   [MOCK] Task: ${taskId}`);
    console.log(`   [MOCK] Prompt: "${prompt.substring(0, 50)}..."`);
    return { taskId, status: 'pending' };
  }

  async mockStatus(taskId) {
    return {
      status: 'completed',
      progress: 100,
      audioUrl: `mock://${taskId}.wav`,
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
      message: 'Replace with real audio from fal.ai',
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

module.exports = FalClient;
