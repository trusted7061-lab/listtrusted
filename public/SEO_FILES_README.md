# SEO Files Documentation

## Overview
This directory contains essential SEO and crawler configuration files for the Trusted Escort website.

## Files

### 1. robots.txt
**Purpose**: Controls search engine crawler access to website sections.

**Location**: `/robots.txt` (https://www.trustedescort.in/robots.txt)

**Features**:
- Allows all major search engines (Google, Bing, Yandex)
- Allows AI crawlers (GPTBot, Claude-Web, Google-Extended, etc.)
- Blocks authentication pages (/signin, /register, /forgot-password)
- Blocks advertiser dashboard and admin areas
- Blocks aggressive scrapers (AhrefsBot, SEMrushBot, etc.)
- References sitemap.xml and llms.txt

**Last Updated**: February 12, 2026

### 2. sitemap.xml
**Purpose**: Helps search engines discover and index all pages on the website.

**Location**: `/sitemap.xml` (https://www.trustedescort.in/sitemap.xml)

**Content**:
- 9 main pages (home, escorts, booking, about, contact, FAQ, privacy, terms, advertiser-signup)
- 68 city location pages (all major Indian cities)
- Priority-based organization:
  - **Priority 1.0**: Homepage
  - **Priority 0.95**: Tier 1 cities (Mumbai, Delhi, Bangalore, Hyderabad, Pune, Goa)
  - **Priority 0.85**: Tier 2 cities (Chennai, Kolkata, Ahmedabad, Jaipur, etc.)
  - **Priority 0.75**: Tier 3 cities
  - **Priority 0.65**: Tier 4 cities
- Daily/weekly update frequency for high-traffic pages

**Total URLs**: 77 (9 main pages + 68 city pages)

**Last Updated**: February 12, 2026

### 3. llms.txt
**Purpose**: Provides AI crawlers with structured information about the website.

**Location**: `/llms.txt` (https://www.trustedescort.in/llms.txt)

**Features**:
- Site description and purpose
- Available services and features
- Complete list of 68 cities
- Main page URLs
- Content guidelines for AI systems
- Technical stack information
- Contact information

**Format**: Human-readable markdown-style format following the llms.txt standard

**Last Updated**: February 12, 2026

## Testing & Validation

### Test robots.txt
Visit in browser:
```
http://localhost:3000/robots.txt
```

Production:
```
https://www.trustedescort.in/robots.txt
```

### Test sitemap.xml
Visit in browser:
```
http://localhost:3000/sitemap.xml
```

Production:
```
https://www.trustedescort.in/sitemap.xml
```

### Test llms.txt
Visit in browser:
```
http://localhost:3000/llms.txt
```

Production:
```
https://www.trustedescort.in/llms.txt
```

## Validation Tools

### 1. Google Search Console
- Submit sitemap.xml for indexing
- Monitor crawl errors
- URL: https://search.google.com/search-console

### 2. Bing Webmaster Tools
- Submit sitemap.xml
- Verify robots.txt
- URL: https://www.bing.com/webmasters

### 3. Online Validators
- **Sitemap Validator**: https://www.xml-sitemaps.com/validate-xml-sitemap.html
- **Robots.txt Tester**: https://support.google.com/webmasters/answer/6062598
- **XML Validator**: https://www.xmlvalidation.com/

## Deployment

These files in the `/public` directory are automatically:
1. Served at the root level in development (`npm run dev`)
2. Copied to the `/dist` folder during build (`npm run build`)
3. Accessible at the root URL in production

**No additional configuration needed** - Vite handles this automatically.

## Maintenance Schedule

### Weekly
- Check for 404 errors in Google Search Console
- Monitor crawl stats

### Monthly
- Update lastmod dates in sitemap.xml
- Review and update blocked bots in robots.txt

### Quarterly
- Add new city pages to sitemap.xml (if any)
- Update llms.txt with new features

### Yearly
- Review priority rankings in sitemap.xml
- Update changefreq values based on actual update patterns

## Important Notes

1. **URL Format**: All city URLs use `/escorts/in/` format with lowercase city names (e.g., `/escorts/in/mumbai`, `/escorts/in/navi-mumbai`)

2. **Priority System**:
   - 1.0: Homepage (most important)
   - 0.9-0.95: High-traffic pages and major cities
   - 0.7-0.8: Standard pages and medium cities
   - 0.5-0.6: Static pages and smaller cities

3. **AI Crawlers**: We allow AI crawlers with appropriate crawl delays to enable beneficial AI integrations while preventing server overload.

4. **Blocked Pages**: Authentication and dashboard pages are blocked to protect user privacy and security.

## Verification Checklist

- [ ] robots.txt accessible at root URL
- [ ] sitemap.xml accessible at root URL
- [ ] llms.txt accessible at root URL
- [ ] All 68 cities included in sitemap
- [ ] All main pages included in sitemap
- [ ] Valid XML format (no syntax errors)
- [ ] Sitemap submitted to Google Search Console
- [ ] Sitemap submitted to Bing Webmaster Tools
- [ ] No 404 errors for URLs in sitemap
- [ ] robots.txt tested with Google's robots.txt Tester

## Support

For issues or updates, refer to:
- Main README.md
- SEO_REPORT.md
- ADVERTISER_FEATURES.md
