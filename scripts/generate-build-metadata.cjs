const fs = require('fs');
const path = require('path');

function generateMetadata() {
  const distDir = path.join(__dirname, '..', 'dist');
  const assetsDir = path.join(distDir, 'assets');
  
  let jsBundles = [];
  let cssBundles = [];
  
  if (fs.existsSync(assetsDir)) {
    const files = fs.readdirSync(assetsDir);
    files.forEach(file => {
      if (file.endsWith('.js')) {
        jsBundles.push(file);
      } else if (file.endsWith('.css')) {
        cssBundles.push(file);
      }
    });
  }
  
  const buildTimestamp = new Date().toISOString();
  // Generate a mock git commit/deployment ID since git is not present in container
  const appletId = process.env.APPLET_ID || "fda7b410-4865-432e-8e96-51f159c2d9f9";
  const shortApplet = appletId.substring(0, 8);
  const timeHex = Date.now().toString(16).substring(4);
  const deploymentId = `dep-${shortApplet}-${timeHex}`;
  const commitHash = `sha256-${require('crypto').createHash('sha256').update(buildTimestamp).digest('hex').substring(0, 12)}`;
  
  const metadata = {
    deploymentId,
    commitHash,
    buildTimestamp,
    jsBundles,
    cssBundles,
    environment: process.env.NODE_ENV || 'production',
    nodeVersion: process.version,
    platform: process.platform
  };
  
  fs.writeFileSync(path.join(distDir, 'build-metadata.json'), JSON.stringify(metadata, null, 2), 'utf-8');
  fs.writeFileSync(path.join(distDir, 'commit.txt'), commitHash, 'utf-8');
  
  console.log('[DevOps Audit] Successfully generated build metadata:', metadata);
}

try {
  generateMetadata();
} catch (err) {
  console.error('[DevOps Audit Error] Failed to generate build metadata:', err);
}
