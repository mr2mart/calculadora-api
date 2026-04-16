/// <reference types="node" />
import { defineConfig } from 'prisma/config'
import * as fs from 'fs'
import * as path from 'path'

// Cargar .env manualmente
const envFile = path.resolve(process.cwd(), '.env')
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, 'utf-8').split('\n')
  for (const line of lines) {
    const [key, ...rest] = line.split('=')
    if (key && rest.length) {
      process.env[key.trim()] = rest.join('=').trim().replace(/^"|"$/g, '')
    }
  }
}

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
})