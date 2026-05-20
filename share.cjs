const localtunnel = require('localtunnel');
const fs = require('fs');

(async () => {
  try {
    const backendTunnel = await localtunnel({ port: 5000 });
    console.log('Backend URL:', backendTunnel.url);
    
    // write to .env
    fs.writeFileSync('.env', `VITE_API_URL=${backendTunnel.url}\n`);
    console.log('Updated .env with VITE_API_URL');
    
    const frontendTunnel = await localtunnel({ port: 5173 });
    console.log('Frontend URL:', frontendTunnel.url);
    console.log('\nShare this link with your friend:');
    console.log('----------------------------------------------------');
    console.log(frontendTunnel.url);
    console.log('----------------------------------------------------');
    console.log('Keep this script running to keep the link active.');

    backendTunnel.on('close', () => {
      console.log('Backend tunnel closed');
    });
    
    frontendTunnel.on('close', () => {
      console.log('Frontend tunnel closed');
    });
  } catch (error) {
    console.error('Error starting localtunnel:', error);
  }
})();
