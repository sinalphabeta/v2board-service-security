import env from 'dotenv'

env.config({
  path: '.env.local',
  debug: true,
})

import('./src/index')
