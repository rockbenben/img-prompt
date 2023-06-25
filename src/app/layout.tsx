import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'IMGPrompt - Stable Diffusion 和 Midjourney 的图像提示词生成工具',
  description: 'IMGPrompt 是一个直观的图像提示词生成工具，可以方便地在 Stable Diffusion 和 Midjourney 的流程中使用，使图像提示词的创建变得简单而有效，轻松激发创意并获得更好的图片结果。通过 IMGPrompt，你可以将自己的创意想法转化为视觉现实。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-Hans">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
