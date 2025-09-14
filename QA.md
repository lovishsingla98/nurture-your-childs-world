# SEO & Performance QA Checklist

## 🚀 Quick Validation Commands

### 1. Crawlability Tests
```bash
# Test robots.txt
curl -s https://nurture.org.in/robots.txt | grep -E "(User-agent|Sitemap)"

# Test sitemap.xml
curl -s https://nurture.org.in/sitemap.xml | grep -E "(loc|changefreq|priority)"

# Test homepage content visibility
curl -s https://nurture.org.in/ | grep -E "(h1|title|description)" | head -5
```

### 2. Social Sharing Tests
- [ ] Share homepage link in private Slack/WhatsApp
- [ ] Verify OG image appears (1200×630 recommended)
- [ ] Check title and description render correctly
- [ ] Test on Facebook Debugger: https://developers.facebook.com/tools/debug/
- [ ] Test on Twitter Card Validator: https://cards-dev.twitter.com/validator

### 3. Head Tags Validation
```bash
# Check meta tags
curl -s https://nurture.org.in/ | grep -E "(meta name=|meta property=)" | head -10

# Check canonical URL
curl -s https://nurture.org.in/ | grep "canonical"

# Check JSON-LD
curl -s https://nurture.org.in/ | grep -A 5 "application/ld+json"
```

### 4. Performance Tests
```bash
# Lighthouse CLI (install first: npm install -g lighthouse)
lighthouse https://nurture.org.in/ --output=html --output-path=./lighthouse-report.html

# PageSpeed Insights API
curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://nurture.org.in/&strategy=mobile" | jq '.lighthouseResult.categories.performance.score'
```

### 5. Security Headers
```bash
# Check security headers
curl -I https://nurture.org.in/ | grep -E "(Strict-Transport-Security|X-Content-Type-Options|Content-Security-Policy)"
```

### 6. Analytics Validation
- [ ] Verify GA4 is receiving page_view events
- [ ] Test CTA tracking by clicking "Join Now" button
- [ ] Check real-time reports in GA4 dashboard

## 📋 Manual Checklist

### SEO Essentials
- [ ] **Title Tag**: "Nurture – AI Co-pilot for Modern Parenting" (50-60 chars)
- [ ] **Meta Description**: Compelling, 150-160 chars, includes keywords
- [ ] **H1 Tag**: Exactly one H1 per page, matches primary promise
- [ ] **Canonical URL**: Points to correct absolute URL
- [ ] **Alt Text**: All images have descriptive alt attributes
- [ ] **Internal Links**: Logical navigation structure

### Social Media
- [ ] **Open Graph**: Title, description, image, URL, type
- [ ] **Twitter Cards**: Summary large image format
- [ ] **OG Image**: 1200×630px, under 1MB, relevant to content
- [ ] **Social Links**: Instagram handle @nurtureapphq

### Technical SEO
- [ ] **Robots.txt**: Accessible at /robots.txt, includes sitemap
- [ ] **Sitemap**: Valid XML, includes all important pages
- [ ] **Schema Markup**: Organization, WebSite, SoftwareApplication
- [ ] **Mobile-Friendly**: Responsive design, fast loading
- [ ] **HTTPS**: SSL certificate valid, redirects HTTP to HTTPS

### Performance
- [ ] **Lighthouse Score**: Performance ≥ 90, SEO ≥ 90
- [ ] **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- [ ] **Image Optimization**: WebP/AVIF format, proper sizing
- [ ] **Font Loading**: font-display: swap, preconnect to font sources
- [ ] **Code Splitting**: Vendor chunks, lazy loading

### Security
- [ ] **HSTS**: Strict-Transport-Security header present
- [ ] **CSP**: Content-Security-Policy without console errors
- [ ] **X-Frame-Options**: Prevents clickjacking
- [ ] **X-Content-Type-Options**: nosniff header
- [ ] **Referrer-Policy**: strict-origin-when-cross-origin

## 🎯 Success Metrics

### Target Scores
- **Lighthouse Performance**: ≥ 90
- **Lighthouse SEO**: ≥ 90
- **Lighthouse Accessibility**: ≥ 90
- **Lighthouse Best Practices**: ≥ 90

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### SEO Metrics
- **Page Load Time**: < 3s
- **Mobile Usability**: 100% mobile-friendly
- **Crawlability**: All pages discoverable by search engines

## 🔧 Troubleshooting

### Common Issues
1. **White Screen**: Check console for JavaScript errors
2. **Missing Meta Tags**: Verify Helmet configuration
3. **Slow Loading**: Optimize images, enable compression
4. **CSP Errors**: Adjust Content-Security-Policy headers
5. **Analytics Not Working**: Verify GA4 measurement ID

### Debug Commands
```bash
# Check for JavaScript errors
curl -s https://nurture.org.in/ | grep -i "error\|exception"

# Validate HTML
curl -s https://nurture.org.in/ | tidy -q -e

# Check redirects
curl -I https://nurture.org.in/
```

## 📊 Monitoring

### Weekly Checks
- [ ] Google Search Console for crawl errors
- [ ] PageSpeed Insights for performance trends
- [ ] GA4 for user engagement metrics
- [ ] Social media previews for sharing

### Monthly Reviews
- [ ] Lighthouse scores comparison
- [ ] Core Web Vitals trends
- [ ] SEO ranking improvements
- [ ] Conversion rate optimization

---

**Last Updated**: $(date)
**Next Review**: $(date -d "+1 month")
