/**
 * Mureka API Client
 *
 * Handles communication with Mureka AI for music generation.
 * https://platform.mureka.ai/
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const config = require('./config');

class MurekaClient {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.MUREKA_API_KEY;
    this.provider = options.provider || 'mureka';
    this.providerConfig = config.api.providers[this.provider];
    this.mockMode = options.mockMode || !this.apiKey;
    this.model = options.model || this.providerConfig?.defaultModel || 'V8';

    if (this.mockMode) {
      console.log('⚠️  Running in MOCK MODE - no API key provided');
      console.log('   Set MUREKA_API_KEY environment variable for real generation');
      console.log('   Get your key at: https://platform.mureka.ai/apiKeys');
    } else {
      console.log(`🎵 Using Mureka API (${this.model})`);
    }
  }

  /**
   * Generate an instrumental loop from a text prompt
   */
  async generate(prompt, options = {}) {
    if (this.mockMode) {
      return this.mockGenerate(prompt, options);
    }

    const payload = {
      prompt: prompt,
      model: options.model || this.model,
      // Mureka-specific parameters
      duration: Math.min(options.duration || config.audio.durationSeconds, 240),
      title: options.title || 'SONGSUGAR Loop'
    };

    try {
      const response = await this.request('POST', this.providerConfig.endpoints.generate, payload);
      return {
        taskId: response.task_id || response.id || response.jobId,
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
      const endpoint = `${this.providerConfig.endpoints.status}/${taskId}`;
      const response = await this.request('GET', endpoint);

      // Mureka status mapping
      const status = response.status || response.state;
      const isComplete = ['completed', 'complete', 'succeeded', 'finished'].includes(status?.toLowerCase());
      const isFailed = ['failed', 'error'].includes(status?.toLowerCase());

      return {
        status: isComplete ? 'completed' : isFailed ? 'failed' : 'pending',
        progress: response.progress || (isComplete ? 100 : 50),
        audioUrl: response.audio_url || response.mp3_url || response.url || response.songs?.[0]?.mp3_url,
        duration: response.duration,
        error: response.error || response.message
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
   * Download audio file from URL
   */
  async downloadAudio(url, outputPath) {
    if (this.mockMode) {
      return this.mockDownload(outputPath);
    }

    return new Promise((resolve, reject) => {
      // Ensure directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const file = fs.createWriteStream(outputPath);
      const protocol = url.startsWith('https') ? https : require('http');

      protocol.get(url, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          // Follow redirect
          this.downloadAudio(response.headers.location, outputPath)
            .then(resolve)
            .catch(reject);
          return;
        }

        if (response.statusCode !== 200) {
          reject(new Error(`Download failed with status ${response.statusCode}`));
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
   * HTTP request helper
   */
  async request(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(this.providerConfig.baseUrl + endpoint);
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
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
              reject(new Error(json.error || json.message || `HTTP ${res.statusCode}`));
            } else {
              resolve(json);
            }
          } catch (e) {
            if (res.statusCode >= 400) {
              reject(new Error(`HTTP ${res.statusCode}: ${body.substring(0, 100)}`));
            } else {
              reject(new Error(`Invalid JSON response: ${body.substring(0, 100)}`));
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

  // ============ MOCK MODE METHODS ============

  async mockGenerate(prompt, options) {
    const taskId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`   [MOCK] Generated task: ${taskId}`);
    console.log(`   [MOCK] Prompt: "${prompt.substring(0, 60)}..."`);
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

    const placeholder = {
      type: 'placeholder',
      message: 'Replace with real audio from Mureka API',
      generatedAt: new Date().toISOString(),
      config: {
        bpm: config.audio.bpm,
        key: config.audio.key,
        scale: config.audio.scale,
        duration: config.audio.durationSeconds
      }
    };

    const placeholderPath = outputPath.replace(/\.(mp3|ogg|wav)$/, '.placeholder.json');
    fs.writeFileSync(placeholderPath, JSON.stringify(placeholder, null, 2));
    console.log(`   [MOCK] Created placeholder: ${path.basename(placeholderPath)}`);
    return placeholderPath;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = MurekaClient;
