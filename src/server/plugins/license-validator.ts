import jwt from 'jsonwebtoken'

export default function (_nitroApp: any) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('🚧 [Local Dev] Skipping local license validation...')
    return
  }

  const licenseKey = process.env.CLARA_LICENSE_KEY

  console.log('🔒 Verifying Aksellearn Local License Key...')

  if (!licenseKey) {
    console.error('❌ FATAL: Missing CLARA_LICENSE_KEY environment variable.')
    console.error(
      'The application cannot start without a valid offline license.',
    )
    process.exit(1)
  }

  // Hardcoded public key or secret used for verification
  // In a real scenario, this would be an RSA Public Key.
  // We use a symmetric secret here for demonstration, but an asymmetric key pair
  // is better so the client can't generate their own licenses.
  // The secret should be securely embedded in the binary via an env variable at build time,
  // or hardcoded specifically for this compiled binary version.
  const LICENSE_SECRET = 'YOUR_SUPER_SECRET_SIGNING_KEY_NEVER_SHARE'

  try {
    // Verify the JWT license token
    const decoded = jwt.verify(licenseKey, LICENSE_SECRET, {
      algorithms: ['HS256'], // Or RS256 if using asymmetric
    }) as any

    // Ensure it matches the expected client
    const expectedDomain = process.env.PUBLIC_DOMAIN || 'unknown'
    if (
      decoded.domain &&
      decoded.domain !== expectedDomain &&
      decoded.domain !== '*'
    ) {
      console.error(
        `❌ FATAL: License domain mismatch. Expected ${expectedDomain}, got ${decoded.domain}`,
      )
      process.exit(1)
    }

    console.log(`✅ License verified locally.`)
    console.log(`   Client: ${decoded.clientName}`)
    if (decoded.exp) {
      console.log(
        `   Valid until: ${new Date(decoded.exp * 1000).toLocaleString()}`,
      )
    }
  } catch (error: any) {
    console.error('❌ FATAL: Invalid or expired license key.')
    if (error.name === 'TokenExpiredError') {
      console.error(
        'Your license has EXPIRED. Please contact support to renew.',
      )
    } else {
      console.error(
        'The provided license key could not be cryptographically verified.',
      )
    }
    process.exit(1)
  }
}
