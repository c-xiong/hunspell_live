import { execSync } from 'child_process';
import os from 'os';

function getArchSpecificPackage() {
    const platform = os.platform();
    const arch = os.arch();
    
    if (platform === 'linux') {
        if (arch === 'x64') {
            return '@rollup/rollup-linux-x64-gnu';
        } else if (arch === 'arm64') {
            return '@rollup/rollup-linux-arm64-gnu';
        }
    }
    // Add other platforms if needed
    return null;
}

try {
    const rollupPackage = getArchSpecificPackage();
    if (rollupPackage) {
        console.log(`Installing ${rollupPackage}...`);
        execSync(`npm install ${rollupPackage}`, { stdio: 'inherit' });
    } else {
        console.log('No platform-specific Rollup package needed');
    }
} catch (error) {
    console.error('Failed to install Rollup:', error);
    process.exit(1);
} 