import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url))
const SCAFFOLD_DIR = join(__dirname, '../../scaffold')

/**
 * Initialize a new campaign
 * @param {string} campaign - Campaign name
 */
export default function init(campaign) {

  if (!campaign) {
    throw new Error('Campaign name is required');
  }

  const campaignDir = path.join(process.cwd(), campaign);

  // if campaign already exists
  const exist = fs.existsSync(campaignDir);
  if (exist) {
    throw new Error(`Campaign ${campaign} already exists`);
  }

  try {
    // Create campaign directory
    fs.mkdirSync(campaignDir, { recursive: true });
    
    // Copy scaffold files
    const scaffoldDir = SCAFFOLD_DIR;
    const files = fs.readdirSync(scaffoldDir);
    files.forEach((file) => {
      fs.copyFileSync(path.join(scaffoldDir, file), path.join(campaignDir, file));
    });
    
    // Validate structure
    const requiredFiles = ['config.json', 'leads.csv', 'template.html', 'suppressions.json'];
    requiredFiles.forEach((file) => {
      if (!fs.existsSync(path.join(campaignDir, file))) {
        throw new Error(`Missing required file: ${file}`);
      }
    });
    
    console.log(chalk.green(`Campaign initialized: ${campaignDir}`));
    console.log(chalk.gray('Next steps:'));
    console.log(chalk.gray(`  1. cd ${campaignDir}`));
    console.log(chalk.gray('  2. Edit config.json with your settings'));
    console.log(chalk.gray('  3. Add contacts to leads.csv'));
    console.log(chalk.gray('  4. Customize template.html'));
    console.log(chalk.gray('  5. Run: coldr schedule\n'));
  } catch (error) {
    console.error(chalk.red('Failed:'), error.message);
    throw error;
  }
}