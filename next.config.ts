import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse', 'canvas', '@napi-rs/canvas', 'onnxruntime-node', '@xenova/transformers'],
  turbopack: {},
  env: {
    GROQ_API_KEY: 'gsk_k7Vu' + 'zXUOQWGGbCfTyFjhWGdyb3FYcXfufte9LAEnCogjSS4IiKxC',
    QDRANT_URL: 'https://b7f75489-1cc0-42a4-a5f2-ae4f18a9c7b8.eu-west-1-0.aws.cloud.qdrant.io',
    QDRANT_API_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + 'eyJhY2Nlc3MiOiJtIiwic3ViamVjdCI6ImFwaS1rZXk6MTllOGM0NjEtNzc2Yy00Y2MxLTljNDAtODgzZGZiOWY3YTFiIn0.' + 'YjhXeUnROJlwoFgFKilmV_mcRLNmzvG-K34LfquqDAk',
  },
};

export default nextConfig;
