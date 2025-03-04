const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * Set up uploads directory structure
 */
function setupUploadsDirectory() {
  const uploadsDir = path.join(__dirname, '../../uploads');
  const tempDir = path.join(uploadsDir, 'temp');
  const mediaDir = path.join(uploadsDir, 'media');
  const profilesDir = path.join(uploadsDir, 'profiles');
  
  // Create main uploads directory if it doesn't exist
  if (!fs.existsSync(uploadsDir)) {
    logger.info('Creating uploads directory');
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Create temp directory for temporary file uploads
  if (!fs.existsSync(tempDir)) {
    logger.info('Creating temp directory');
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  // Create media directory for post media
  if (!fs.existsSync(mediaDir)) {
    logger.info('Creating media directory');
    fs.mkdirSync(mediaDir, { recursive: true });
  }
  
  // Create profiles directory for profile pictures
  if (!fs.existsSync(profilesDir)) {
    logger.info('Creating profiles directory');
    fs.mkdirSync(profilesDir, { recursive: true });
  }
  
  // Create .gitkeep files to ensure directories are tracked in git
  const gitkeepFiles = [
    path.join(uploadsDir, '.gitkeep'),
    path.join(tempDir, '.gitkeep'),
    path.join(mediaDir, '.gitkeep'),
    path.join(profilesDir, '.gitkeep')
  ];
  
  gitkeepFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, '');
    }
  });
  
  // Create .gitignore file to ignore uploaded files but track directory structure
  const gitignoreContent = `# Ignore all files in this directory
*
# Except for .gitkeep and .gitignore
!.gitkeep
!.gitignore
# And except for subdirectories
!*/`;
  
  fs.writeFileSync(path.join(uploadsDir, '.gitignore'), gitignoreContent);
  
  logger.info('Uploads directory structure set up successfully');
}

module.exports = setupUploadsDirectory; 