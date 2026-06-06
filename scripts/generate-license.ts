import jwt from 'jsonwebtoken'
import { parseArgs } from 'util'

// To run this:
// bun run scripts/generate-license.ts --client="Madacoda Inc." --domain="api.madacoda.dev" --days=365

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    client: {
      type: 'string',
    },
    domain: {
      type: 'string',
    },
    days: {
      type: 'string',
    },
  },
  strict: false,
  allowPositionals: true,
})

const clientName = (values.client as string) || 'Unknown Client'
const domain = (values.domain as string) || '*'
const daysStr = (values.days as string) || '365'

const LICENSE_SECRET = 'YOUR_SUPER_SECRET_SIGNING_KEY_NEVER_SHARE'

const payload = {
  clientName,
  domain,
}

const signOptions: jwt.SignOptions = {}
if (daysStr !== '*') {
  const days = parseInt(daysStr, 10)
  signOptions.expiresIn = `${days}d`
}

const token = jwt.sign(payload, LICENSE_SECRET, signOptions)

console.log('🎉 License Generated Successfully!\n')
console.log(`Client: ${clientName}`)
console.log(`Domain: ${domain}`)
console.log(`Valid For: ${daysStr === '*' ? 'LIFETIME' : `${daysStr} days`}`)
console.log('\n=======================================')
console.log('YOUR OFFLINE LICENSE KEY:')
console.log('=======================================')
console.log(token)
console.log('=======================================\n')
console.log('Export this on the client server before running the binary:')
console.log(`export CLARA_LICENSE_KEY="${token}"`)
