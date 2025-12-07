const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    externalDir: true,
  },
  turbopack: {},
  webpack: (config, { isServer }) => {
    // Resolve feedback-vos to source for local development
    if (!config.resolve.alias) {
      config.resolve.alias = {}
    }
    config.resolve.alias['feedback-vos'] = path.resolve(__dirname, '../src')
    
    // Handle CSS imports from feedback-vos/styles
    config.resolve.alias['feedback-vos/styles'] = path.resolve(__dirname, '../src/styles.css')
    
    // Ensure CSS files are handled correctly
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.css')
    )
    if (fileLoaderRule) {
      fileLoaderRule.exclude = /node_modules/
    }
    
    return config
  },
}

module.exports = nextConfig

