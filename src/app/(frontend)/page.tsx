//Payload CMS Built in imports
import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import { fileURLToPath } from 'url'

import config from '@/payload.config'
import './styles.css'

//My imports
import Navbar from '@/app/(frontend)/components/layout/Navbar'
import Hero from '@/app/(frontend)/components/sections/Hero'
import Features from '@/app/(frontend)/components/sections/Features'
import HowItWorks from '@/app/(frontend)/components/sections/HowItWorks'
import Testimonials from '@/app/(frontend)/components/sections/Testimonials'
import Pricing from '@/app/(frontend)/components/sections/Pricing'
import Footer from '@/app/(frontend)/components/layout/Footer'

export default async function HomePage() {
  const _headers = await getHeaders()
  const payloadConfig = await config
  const _payload = await getPayload({ config: payloadConfig })

  const _fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`

  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <Footer />
    </>
  )
}
