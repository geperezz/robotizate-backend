import '@dotenvx/dotenvx/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/tables',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DB_URL!,
  },
})