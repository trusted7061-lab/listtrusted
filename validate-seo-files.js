import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}════════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.cyan}   SEO Files Validation - Trusted Escort${colors.reset}`);
console.log(`${colors.cyan}════════════════════════════════════════════════════${colors.reset}\n`);

const publicDir = path.join(__dirname, 'public');
const filesToCheck = [
  { name: 'robots.txt', required: true },
  { name: 'sitemap.xml', required: true },
  { name: 'llms.txt', required: true }
];

let allPassed = true;

// Check if files exist and are readable
console.log(`${colors.blue}[1] Checking file existence...${colors.reset}\n`);

filesToCheck.forEach(file => {
  const filePath = path.join(publicDir, file.name);
  
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`${colors.green}✓${colors.reset} ${file.name} - Found (${stats.size} bytes)`);
  } else {
    console.log(`${colors.red}✗${colors.reset} ${file.name} - Missing!`);
    allPassed = false;
  }
});

console.log(`\n${colors.blue}[2] Validating robots.txt...${colors.reset}\n`);

try {
  const robotsPath = path.join(publicDir, 'robots.txt');
  const robotsContent = fs.readFileSync(robotsPath, 'utf-8');
  
  const checks = {
    'User-agent directive': robotsContent.includes('User-agent:'),
    'Allow directive': robotsContent.includes('Allow:'),
    'Disallow directive': robotsContent.includes('Disallow:'),
    'Sitemap reference': robotsContent.includes('Sitemap:'),
    'Blocks auth pages': robotsContent.includes('/signin') && robotsContent.includes('/register'),
    'Blocks dashboard': robotsContent.includes('/advertiser-dashboard'),
    'AI crawler rules': robotsContent.includes('GPTBot') || robotsContent.includes('anthropic-ai'),
    'Blocks bad bots': robotsContent.includes('AhrefsBot') || robotsContent.includes('SEMrushBot')
  };
  
  Object.entries(checks).forEach(([check, passed]) => {
    if (passed) {
      console.log(`${colors.green}✓${colors.reset} ${check}`);
    } else {
      console.log(`${colors.red}✗${colors.reset} ${check}`);
      allPassed = false;
    }
  });
} catch (error) {
  console.log(`${colors.red}✗${colors.reset} Error reading robots.txt: ${error.message}`);
  allPassed = false;
}

console.log(`\n${colors.blue}[3] Validating sitemap.xml...${colors.reset}\n`);

try {
  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
  
  // Basic XML validation
  const checks = {
    'Valid XML declaration': sitemapContent.startsWith('<?xml version="1.0"'),
    'Has urlset tag': sitemapContent.includes('<urlset'),
    'Has namespace': sitemapContent.includes('http://www.sitemaps.org/schemas/sitemap/0.9'),
    'Has URLs': sitemapContent.includes('<url>'),
    'Has loc tags': sitemapContent.includes('<loc>'),
    'Has priority tags': sitemapContent.includes('<priority>'),
    'Has lastmod tags': sitemapContent.includes('<lastmod>'),
    'Properly closed': sitemapContent.includes('</urlset>')
  };
  
  Object.entries(checks).forEach(([check, passed]) => {
    if (passed) {
      console.log(`${colors.green}✓${colors.reset} ${check}`);
    } else {
      console.log(`${colors.red}✗${colors.reset} ${check}`);
      allPassed = false;
    }
  });
  
  // Count URLs
  const urlMatches = sitemapContent.match(/<url>/g);
  const urlCount = urlMatches ? urlMatches.length : 0;
  console.log(`\n${colors.cyan}ℹ${colors.reset} Total URLs in sitemap: ${urlCount}`);
  
  // Count cities
  const cityMatches = sitemapContent.match(/\/location\//g);
  const cityCount = cityMatches ? cityMatches.length : 0;
  console.log(`${colors.cyan}ℹ${colors.reset} City pages in sitemap: ${cityCount}`);
  
  // Check for required pages
  const requiredPages = [
    { name: 'Homepage', url: 'https://trustedescort.in/' },
    { name: 'Escorts page', url: 'https://trustedescort.in/escorts' },
    { name: 'About page', url: 'https://trustedescort.in/about' },
    { name: 'Contact page', url: 'https://trustedescort.in/contact' }
  ];
  
  console.log(`\n${colors.blue}Required pages:${colors.reset}`);
  requiredPages.forEach(page => {
    const found = sitemapContent.includes(page.url);
    if (found) {
      console.log(`${colors.green}✓${colors.reset} ${page.name}`);
    } else {
      console.log(`${colors.red}✗${colors.reset} ${page.name} - Missing!`);
      allPassed = false;
    }
  });
  
  // Check sample major cities
  const majorCities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Goa'];
  console.log(`\n${colors.blue}Sample major cities:${colors.reset}`);
  majorCities.forEach(city => {
    const found = sitemapContent.includes(`/escorts/in/${city}`);
    if (found) {
      console.log(`${colors.green}✓${colors.reset} ${city}`);
    } else {
      console.log(`${colors.yellow}⚠${colors.reset} ${city} - Not found`);
    }
  });
  
} catch (error) {
  console.log(`${colors.red}✗${colors.reset} Error reading sitemap.xml: ${error.message}`);
  allPassed = false;
}

console.log(`\n${colors.blue}[4] Validating llms.txt...${colors.reset}\n`);

try {
  const llmsPath = path.join(publicDir, 'llms.txt');
  const llmsContent = fs.readFileSync(llmsPath, 'utf-8');
  
  const checks = {
    'Has site name': llmsContent.includes('Trusted Escort'),
    'Has description': llmsContent.includes('Description:'),
    'Has purpose section': llmsContent.includes('# Purpose'),
    'Has services listed': llmsContent.includes('# Main Services') || llmsContent.includes('Services'),
    'Has cities list': llmsContent.includes('Mumbai') && llmsContent.includes('Delhi'),
    'Has main pages': llmsContent.includes('# Main Pages'),
    'Has contact info': llmsContent.includes('# Contact'),
    'Has sitemap reference': llmsContent.includes('sitemap')
  };
  
  Object.entries(checks).forEach(([check, passed]) => {
    if (passed) {
      console.log(`${colors.green}✓${colors.reset} ${check}`);
    } else {
      console.log(`${colors.red}✗${colors.reset} ${check}`);
      allPassed = false;
    }
  });
  
  const lines = llmsContent.split('\n').length;
  console.log(`\n${colors.cyan}ℹ${colors.reset} Total lines in llms.txt: ${lines}`);
  
} catch (error) {
  console.log(`${colors.red}✗${colors.reset} Error reading llms.txt: ${error.message}`);
  allPassed = false;
}

console.log(`\n${colors.cyan}════════════════════════════════════════════════════${colors.reset}`);

if (allPassed) {
  console.log(`${colors.green}✓ All validations passed!${colors.reset}`);
  console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
  console.log(`  1. Run development server: npm run dev`);
  console.log(`  2. Test files in browser:`);
  console.log(`     - http://localhost:3000/robots.txt`);
  console.log(`     - http://localhost:3000/sitemap.xml`);
  console.log(`     - http://localhost:3000/llms.txt`);
  console.log(`  3. Build for production: npm run build`);
  console.log(`  4. Submit sitemap to Google Search Console`);
  console.log(`  5. Submit sitemap to Bing Webmaster Tools`);
} else {
  console.log(`${colors.red}✗ Some validations failed. Please review the output above.${colors.reset}`);
  process.exit(1);
}

console.log(`${colors.cyan}════════════════════════════════════════════════════${colors.reset}\n`);
