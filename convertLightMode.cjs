const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'components', 'landing');
const homeFile = path.join(__dirname, 'src', 'pages', 'Home.jsx');

const replacements = {
  'bg-[#0a0a0f]': 'bg-[#f9fafb]',
  'text-white': 'text-[#111827]',
  'text-gray-400': 'text-gray-600',
  'text-gray-300': 'text-gray-700',
  'text-gray-500': 'text-gray-500',
  'bg-[#12121a]': 'bg-white',
  'border-white/10': 'border-gray-200',
  'border-white/5': 'border-gray-100',
  'bg-white/5': 'bg-gray-50',
  'bg-white/10': 'bg-gray-100',
  'hover:bg-white/10': 'hover:bg-gray-100',
  'hover:text-white': 'hover:text-indigo-600',
  'glass-panel': 'bg-white/80 border border-gray-200/60 shadow-lg backdrop-blur-xl',
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    content = content.replace(regex, value);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

// Process Home.jsx
if (fs.existsSync(homeFile)) {
  processFile(homeFile);
}

// Process landing components
if (fs.existsSync(directoryPath)) {
  const files = fs.readdirSync(directoryPath);
  files.forEach(file => {
    if (file.endsWith('.jsx')) {
      processFile(path.join(directoryPath, file));
    }
  });
}
