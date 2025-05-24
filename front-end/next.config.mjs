/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pkfjmobhbnvlyvfxcptd.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig;