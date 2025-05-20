import '@dotenvx/dotenvx/config'
import { drizzle } from 'drizzle-orm/postgres-js'

import * as tables from './tables'

export const db = drizzle(process.env.DB_URL!, { schema: tables })

export type Db = typeof db