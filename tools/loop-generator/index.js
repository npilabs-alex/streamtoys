#!/usr/bin/env node
/**
 * SONGSUGAR Loop Pack Generator CLI
 *
 * Usage:
 *   node index.js [command] [options]
 *
 * Commands:
 *   generate-all     Generate all loops in all categories
 *   generate-pack    Generate a specific pack (e.g., starter, lofi_chill)
 *   generate-loop    Generate a specific loop by ID
 *   list             List all available loops and packs
 *   manifest         Export game-ready manifest
 *
 * Options:
 *   --api-key        Suno API key (or set SUNO_API_KEY env var)
 *   --mock           Run in mock mode (creates placeholders)
 *   --pack           Pack ID for generate-pack command
 *   --loop           Loop ID for generate-loop command
 *   --category       Category for generate-loop command
 *
 * Examples:
 *   node index.js list
 *   node index.js generate-all --mock
 *   node index.js generate-pack --pack starter
 *   node index.js generate-loop --category BEAT --loop trap_808
 *   SUNO_API_KEY=xxx node index.js generate-all
 */

const LoopGenerator = require('./generator');
const config = require('./config');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    command: args[0] || 'help',
    options: {}
  };

  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true;
      result.options[key] = value;
    }
  }

  return result;
}

// Help text
function showHelp() {
  console.log(`
🎵 SONGSUGAR Loop Pack Generator
═══════════════════════════════════════════════════

Usage: node index.js <command> [options]

Commands:
  list              List all available loops and packs
  generate-all      Generate all loops (24 total)
  generate-starter  Generate starter pack (9 essential loops)
  generate-pack     Generate a themed pack
  generate-loop     Generate a single loop
  manifest          Export game-ready manifest

Options:
  --api-key <key>   API key for the provider
  --provider <name> API provider: fal (default), mureka, sunoapi
  --mock            Run in mock mode (creates placeholders)
  --pack <id>       Pack ID (starter, lofi_chill, dark_trap, etc.)
  --category <cat>  Category (BEAT, VIBE, MELODY)
  --loop <id>       Loop ID (trap_808, lofi_vinyl, etc.)

Examples:
  node index.js list
  node index.js generate-starter --mock
  REPLICATE_API_TOKEN=xxx node index.js generate-starter
  node index.js generate-loop --category BEAT --loop trap_808 --api-key YOUR_KEY

Environment Variables:
  REPLICATE_API_TOKEN  Replicate API key (default, recommended)
  FAL_KEY              fal.ai API key
  MUREKA_API_KEY       Mureka API key
  SUNO_API_KEY         Suno API key (unofficial)

Get your API key:
  Replicate (recommended): https://replicate.com/account/api-tokens
  fal.ai:                  https://fal.ai/dashboard/keys
`);
}

// List command
function listCommand() {
  LoopGenerator.listLoops();
}

// Main async function
async function main() {
  const { command, options } = parseArgs();

  // Determine provider and API key
  const provider = options.provider || config.api.defaultProvider;
  let apiKey = options['api-key'];

  // Check for provider-specific env vars
  if (!apiKey) {
    if (provider === 'replicate') {
      apiKey = process.env.REPLICATE_API_TOKEN;
    } else if (provider === 'beatoven') {
      apiKey = process.env.BEATOVEN_API_KEY;
    } else if (provider === 'fal') {
      apiKey = process.env.FAL_KEY;
    } else if (provider === 'mureka') {
      apiKey = process.env.MUREKA_API_KEY;
    } else {
      apiKey = process.env.SUNO_API_KEY;
    }
  }

  const mockMode = options.mock || !apiKey;

  // Create generator
  const generator = new LoopGenerator({
    apiKey: apiKey,
    provider: provider,
    mockMode: mockMode
  });

  try {
    switch (command) {
      case 'help':
      case '--help':
      case '-h':
        showHelp();
        break;

      case 'list':
        listCommand();
        break;

      case 'generate-all':
        await generator.generateAll();
        generator.exportGameManifest();
        break;

      case 'generate-starter':
        await generator.generateStarter();
        generator.exportGameManifest();
        break;

      case 'generate-pack':
        if (!options.pack) {
          console.error('❌ Missing --pack option');
          console.log('   Available packs:', config.packs.map(p => p.id).join(', '));
          process.exit(1);
        }
        await generator.generatePack(options.pack);
        generator.exportGameManifest();
        break;

      case 'generate-loop':
        if (!options.category || !options.loop) {
          console.error('❌ Missing --category or --loop option');
          console.log('   Example: --category BEAT --loop trap_808');
          process.exit(1);
        }
        const category = config.categories[options.category];
        if (!category) {
          console.error(`❌ Unknown category: ${options.category}`);
          console.log('   Available: BEAT, VIBE, MELODY');
          process.exit(1);
        }
        const loop = category.loops.find(l => l.id === options.loop);
        if (!loop) {
          console.error(`❌ Unknown loop: ${options.loop}`);
          console.log('   Available:', category.loops.map(l => l.id).join(', '));
          process.exit(1);
        }
        generator.ensureOutputDirs();
        await generator.generateLoop(options.category, loop);
        generator.printSummary();
        break;

      case 'manifest':
        generator.ensureOutputDirs();
        generator.exportGameManifest();
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run
main();
