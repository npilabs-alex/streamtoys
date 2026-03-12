/**
 * Loop Pack Generator
 *
 * Generates loop packs using Suno API based on the SONGSUGAR ontology.
 * Outputs organized audio files ready for the game.
 */

const fs = require('fs');
const path = require('path');
const config = require('./config');
const SunoClient = require('./suno-client');

class LoopGenerator {
  constructor(options = {}) {
    this.client = new SunoClient(options);
    this.outputDir = path.resolve(__dirname, config.output.directory);
    this.results = {
      generated: [],
      failed: [],
      skipped: []
    };
  }

  /**
   * Generate all loops in a category
   */
  async generateCategory(categoryId) {
    const category = config.categories[categoryId];
    if (!category) {
      throw new Error(`Unknown category: ${categoryId}`);
    }

    console.log(`\n🎵 Generating ${categoryId} loops (${category.loops.length} total)`);
    console.log(`   ${category.description}`);
    console.log('─'.repeat(50));

    for (const loop of category.loops) {
      await this.generateLoop(categoryId, loop);
    }

    return this.results;
  }

  /**
   * Generate a single loop
   */
  async generateLoop(categoryId, loop) {
    const outputPath = this.getOutputPath(categoryId, loop.id);

    // Check if already exists
    if (fs.existsSync(outputPath)) {
      console.log(`   ⏭️  ${loop.name} - already exists, skipping`);
      this.results.skipped.push({ categoryId, loop, reason: 'exists' });
      return;
    }

    console.log(`   🎹 ${loop.name}`);
    console.log(`      Prompt: "${loop.prompt.substring(0, 50)}..."`);

    try {
      // Start generation
      const task = await this.client.generate(loop.prompt, {
        duration: config.audio.durationSeconds
      });

      // Wait for completion
      const result = await this.client.waitForCompletion(task.taskId, (status) => {
        if (status.progress) {
          process.stdout.write(`\r      Progress: ${status.progress}%`);
        }
      });
      console.log(''); // New line after progress

      // Download audio
      if (result.audioUrl) {
        await this.client.downloadAudio(result.audioUrl, outputPath);
        console.log(`      ✅ Downloaded: ${path.basename(outputPath)}`);
      }

      // Save metadata
      this.saveMetadata(categoryId, loop, result);

      this.results.generated.push({ categoryId, loop, outputPath });

    } catch (error) {
      console.log(`      ❌ Failed: ${error.message}`);
      this.results.failed.push({ categoryId, loop, error: error.message });
    }
  }

  /**
   * Generate a themed pack
   */
  async generatePack(packId) {
    const pack = config.packs.find(p => p.id === packId);
    if (!pack) {
      throw new Error(`Unknown pack: ${packId}`);
    }

    console.log(`\n📦 Generating Pack: ${pack.name}`);
    console.log(`   ${pack.description}`);
    console.log(`   Loops: ${pack.loops.join(', ')}`);
    console.log('═'.repeat(50));

    for (const loopId of pack.loops) {
      // Find the loop in categories
      for (const [catId, category] of Object.entries(config.categories)) {
        const loop = category.loops.find(l => l.id === loopId);
        if (loop) {
          await this.generateLoop(catId, loop);
          break;
        }
      }
    }

    // Save pack manifest
    this.savePackManifest(pack);

    return this.results;
  }

  /**
   * Generate all loops
   */
  async generateAll() {
    console.log('🚀 SONGSUGAR Loop Generator');
    console.log('═'.repeat(50));
    console.log(`   BPM: ${config.audio.bpm}`);
    console.log(`   Key: ${config.audio.key} ${config.audio.scale}`);
    console.log(`   Duration: ${config.audio.durationSeconds.toFixed(2)}s (4 bars)`);
    console.log(`   Output: ${this.outputDir}`);
    console.log('═'.repeat(50));

    // Ensure output directory exists
    this.ensureOutputDirs();

    // Generate each category
    for (const categoryId of Object.keys(config.categories)) {
      await this.generateCategory(categoryId);
    }

    // Print summary
    this.printSummary();

    return this.results;
  }

  /**
   * Generate starter pack only
   */
  async generateStarter() {
    return this.generatePack('starter');
  }

  /**
   * Get output path for a loop
   */
  getOutputPath(categoryId, loopId, format = 'mp3') {
    const template = config.output.naming;
    const filename = template
      .replace('{category}', categoryId.toLowerCase())
      .replace('{id}', loopId)
      .replace('{format}', format);
    return path.join(this.outputDir, filename);
  }

  /**
   * Ensure output directories exist
   */
  ensureOutputDirs() {
    for (const categoryId of Object.keys(config.categories)) {
      const dir = path.join(this.outputDir, categoryId.toLowerCase());
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`   Created: ${dir}`);
      }
    }
  }

  /**
   * Save loop metadata
   */
  saveMetadata(categoryId, loop, result) {
    const metadataPath = this.getOutputPath(categoryId, loop.id, 'json');
    const metadata = {
      id: loop.id,
      name: loop.name,
      category: categoryId,
      prompt: loop.prompt,
      tags: loop.tags,
      audio: {
        bpm: config.audio.bpm,
        key: config.audio.key,
        scale: config.audio.scale,
        duration: result.duration || config.audio.durationSeconds,
        bars: config.audio.bars
      },
      generated: new Date().toISOString(),
      source: 'suno'
    };

    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  }

  /**
   * Save pack manifest
   */
  savePackManifest(pack) {
    const manifestPath = path.join(this.outputDir, `pack_${pack.id}.json`);
    const manifest = {
      ...pack,
      generated: new Date().toISOString(),
      audio: {
        bpm: config.audio.bpm,
        key: config.audio.key,
        scale: config.audio.scale
      },
      files: pack.loops.map(loopId => {
        // Find category for this loop
        for (const [catId, category] of Object.entries(config.categories)) {
          const loop = category.loops.find(l => l.id === loopId);
          if (loop) {
            return {
              id: loopId,
              category: catId,
              path: `${catId.toLowerCase()}/${loopId}.mp3`,
              name: loop.name
            };
          }
        }
        return null;
      }).filter(Boolean)
    };

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`\n   📋 Pack manifest: ${path.basename(manifestPath)}`);
  }

  /**
   * Print generation summary
   */
  printSummary() {
    console.log('\n' + '═'.repeat(50));
    console.log('📊 Generation Summary');
    console.log('═'.repeat(50));
    console.log(`   ✅ Generated: ${this.results.generated.length}`);
    console.log(`   ⏭️  Skipped:   ${this.results.skipped.length}`);
    console.log(`   ❌ Failed:    ${this.results.failed.length}`);

    if (this.results.failed.length > 0) {
      console.log('\n   Failed loops:');
      for (const fail of this.results.failed) {
        console.log(`      - ${fail.loop.name}: ${fail.error}`);
      }
    }

    console.log('\n' + '═'.repeat(50));
  }

  /**
   * List all available loops
   */
  static listLoops() {
    console.log('\n📋 Available Loops');
    console.log('═'.repeat(50));

    for (const [catId, category] of Object.entries(config.categories)) {
      console.log(`\n${catId} (${category.color})`);
      console.log(`   ${category.description}`);
      for (const loop of category.loops) {
        console.log(`   • ${loop.id.padEnd(20)} ${loop.name}`);
      }
    }

    console.log('\n📦 Available Packs');
    console.log('═'.repeat(50));
    for (const pack of config.packs) {
      console.log(`   • ${pack.id.padEnd(15)} ${pack.name} (${pack.loops.length} loops)`);
    }
  }

  /**
   * Export game-ready manifest
   */
  exportGameManifest() {
    const manifest = {
      version: '1.0.0',
      generated: new Date().toISOString(),
      audio: config.audio,
      categories: {},
      packs: config.packs.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        loops: p.loops,
        unlocked: p.unlocked || false,
        theme: p.theme
      }))
    };

    // Build category manifest
    for (const [catId, category] of Object.entries(config.categories)) {
      manifest.categories[catId] = {
        color: category.color,
        description: category.description,
        loops: category.loops.map(loop => ({
          id: loop.id,
          name: loop.name,
          tags: loop.tags,
          file: `${catId.toLowerCase()}/${loop.id}.mp3`
        }))
      };
    }

    const manifestPath = path.join(this.outputDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`\n🎮 Game manifest exported: ${manifestPath}`);

    return manifest;
  }
}

module.exports = LoopGenerator;
