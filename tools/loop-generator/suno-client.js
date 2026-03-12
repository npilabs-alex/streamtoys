/**
 * Suno API Client
 *
 * Handles communication with Suno API providers for music generation.
 * Supports multiple providers and includes retry logic.
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const config = require('./config');

class SunoClient {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.SUNO_API_KEY;
    this.provider = options.provider || config.api.defaultProvider;
    this.providerConfig = config.api.providers[this.provider];
    this.mockMode = options.mockMode || !this.apiKey;

    if (this.mockMode) {
      console.log('⚠️  Running in MOCK MODE - no API key provided');
      console.log('   Set SUNO_API_KEY environment variable for real generation');
    }
  }

  /**
   * Generate a loop from a text prompt
   */
  async generate(prompt, options = {}) {
    if (this.mockMode) {
      return this.mockGenerate(prompt, options);
    }

    const payload = {
      prompt: prompt,
      duration: options.duration || config.audio.durationSeconds,
      make_instrumental: true,
      wait_audio: false // We'll poll for status
    };

    try {
      const response = await this.request('POST', this.providerConfig.endpoints.generate, payload);
      return {
        taskId: response.task_id || response.id,
        status: 'pending'
      };
    } catch (error) {
      throw new Error(`Generation failed: ${error.message}`);
    }
  }

  /**
   * Check generation status and get result
   */
  async getStatus(taskId) {
    if (this.mockMode) {
      return this.mockStatus(taskId);
    }

    try {
      const response = await this.request('GET', `${this.providerConfig.endpoints.status}/${taskId}`);
      return {
        status: response.status,
        progress: response.progress || 0,
        audioUrl: response.audio_url || response.url,
        duration: response.duration
      };
    } catch (error) {
      throw new Error(`Status check failed: ${error.message}`);
    }
  }

  /**
   * Wait for generation to complete with polling
   */
  async waitForCompletion(taskId, onProgress = null) {
    const startTime = Date.now();
    const timeout = config.api.timeoutMs;
    const pollInterval = config.api.pollIntervalMs;

    while (Date.now() - startTime < timeout) {
      const status = await this.getStatus(taskId);

      if (onProgress) {
        onProgress(status);
      }

      if (status.status === 'completed' || status.status === 'complete') {
        return status;
      }

      if (status.status === 'failed' || status.status === 'error') {
        throw new Error(`Generation failed: ${status.error || 'Unknown error'}`);
      }

      await this.sleep(pollInterval);
    }

    throw new Error('Generation timed out');
  }

  /**
   * Download audio file from URL
   */
  async downloadAudio(url, outputPath) {
    if (this.mockMode) {
      return this.mockDownload(outputPath);
    }

    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(outputPath);
      const protocol = url.startsWith('https') ? https : http;

      protocol.get(url, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          // Follow redirect
          this.downloadAudio(response.headers.location, outputPath)
            .then(resolve)
            .catch(reject);
          return;
        }

        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(outputPath);
        });
      }).on('error', (err) => {
        fs.unlink(outputPath, () => {}); // Delete partial file
        reject(err);
      });
    });
  }

  /**
   * Request stem separation for a track
   */
  async separateStems(audioUrl, stemTypes = ['drums', 'bass', 'vocals', 'other']) {
    if (this.mockMode) {
      return this.mockStems(stemTypes);
    }

    const payload = {
      audio_url: audioUrl,
      stem_types: stemTypes
    };

    try {
      const response = await this.request('POST', this.providerConfig.endpoints.stems, payload);
      return {
        taskId: response.task_id || response.id,
        status: 'pending'
      };
    } catch (error) {
      throw new Error(`Stem separation failed: ${error.message}`);
    }
  }

  /**
   * HTTP request helper
   */
  async request(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(this.providerConfig.baseUrl + endpoint);
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        }
      };

      const protocol = url.protocol === 'https:' ? https : http;
      const req = protocol.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(body);
            if (res.statusCode >= 400) {
              reject(new Error(json.error || json.message || `HTTP ${res.statusCode}`));
            } else {
              resolve(json);
            }
          } catch (e) {
            reject(new Error(`Invalid JSON response: ${body.substring(0, 100)}`));
          }
        });
      });

      req.on('error', reject);

      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  // ============ MOCK MODE METHODS ============

  /**
   * Mock generation - creates a task ID
   */
  async mockGenerate(prompt, options) {
    const taskId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`   [MOCK] Generated task: ${taskId}`);
    console.log(`   [MOCK] Prompt: "${prompt.substring(0, 60)}..."`);
    return {
      taskId,
      status: 'pending'
    };
  }

  /**
   * Mock status - simulates progress
   */
  async mockStatus(taskId) {
    // Simulate instant completion in mock mode
    return {
      status: 'completed',
      progress: 100,
      audioUrl: `mock://${taskId}.mp3`,
      duration: config.audio.durationSeconds
    };
  }

  /**
   * Mock download - creates a placeholder file
   */
  async mockDownload(outputPath) {
    // Create directory if needed
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Create a placeholder file with metadata
    const placeholder = {
      type: 'placeholder',
      message: 'Replace with real audio from Suno API',
      generatedAt: new Date().toISOString(),
      config: {
        bpm: config.audio.bpm,
        key: config.audio.key,
        scale: config.audio.scale,
        duration: config.audio.durationSeconds
      }
    };

    // Write JSON placeholder (real implementation would write audio)
    const placeholderPath = outputPath.replace(/\.(mp3|ogg|wav)$/, '.placeholder.json');
    fs.writeFileSync(placeholderPath, JSON.stringify(placeholder, null, 2));

    console.log(`   [MOCK] Created placeholder: ${path.basename(placeholderPath)}`);
    return placeholderPath;
  }

  /**
   * Mock stem separation
   */
  async mockStems(stemTypes) {
    return {
      taskId: `mock_stems_${Date.now()}`,
      status: 'completed',
      stems: stemTypes.map(type => ({
        type,
        url: `mock://stem_${type}.mp3`
      }))
    };
  }

  /**
   * Sleep helper
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = SunoClient;
