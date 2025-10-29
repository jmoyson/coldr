import fs from 'fs';
import path from 'path';

/**
 * File system utilities following Single Responsibility Principle
 */

/**
 * Check if a directory exists
 * @param {string} dirPath - Directory path to check
 * @returns {boolean}
 */
export function directoryExists(dirPath) {
  return fs.existsSync(dirPath);
}

/**
 * Check if a file exists
 * @param {string} filePath - File path to check
 * @returns {boolean}
 */
export function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Create a directory recursively
 * @param {string} dirPath - Directory path to create
 */
export function createDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

/**
 * Read and parse a JSON file
 * @param {string} filePath - Path to JSON file
 * @returns {Object} Parsed JSON object
 * @throws {Error} If file cannot be read or parsed
 */
export function readJsonFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Copy a file from source to destination
 * @param {string} source - Source file path
 * @param {string} destination - Destination file path
 */
export function copyFile(source, destination) {
  fs.copyFileSync(source, destination);
}

/**
 * Copy all files from source directory to destination directory
 * @param {string} sourceDir - Source directory path
 * @param {string} destDir - Destination directory path
 */
export function copyDirectory(sourceDir, destDir) {
  const files = fs.readdirSync(sourceDir);
  files.forEach((file) => {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(destDir, file);
    copyFile(sourcePath, destPath);
  });
}

/**
 * Validate that all required files exist in a directory
 * @param {string} dirPath - Directory path to check
 * @param {string[]} requiredFiles - Array of required file names
 * @returns {Object} { valid: boolean, missingFiles: string[] }
 */
export function validateRequiredFiles(dirPath, requiredFiles) {
  const missingFiles = requiredFiles.filter(
    (file) => !fileExists(path.join(dirPath, file))
  );
  
  return {
    valid: missingFiles.length === 0,
    missingFiles
  };
}

/**
 * Get the absolute path for a campaign directory
 * @param {string} campaignName - Campaign name
 * @returns {string} Absolute path to campaign directory
 */
export function getCampaignPath(campaignName) {
  return path.join(process.cwd(), campaignName);
}

/**
 * Get the absolute path for a file within a campaign
 * @param {string} campaignPath - Campaign directory path
 * @param {string} fileName - File name
 * @returns {string} Absolute path to file
 */
export function getCampaignFilePath(campaignPath, fileName) {
  return path.join(campaignPath, fileName);
}

/**
 * Read a text file
 * @param {string} filePath - Path to file
 * @returns {string} File content
 * @throws {Error} If file cannot be read
 */
export function readTextFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}
