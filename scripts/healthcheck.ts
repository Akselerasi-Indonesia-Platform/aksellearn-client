/**
 * Minimalist TCP Health Check
 * Compiled into a native binary to run in Distroless environments
 */
const PORT = parseInt(process.env.PORT || '2000')
const HOST = '127.0.0.1'

try {
  // @ts-ignore - Bun global is available at runtime
  const socket = await Bun.connect({
    hostname: HOST,
    port: PORT,
  })
  socket.end()
  process.exit(0)
} catch (err) {
  // If connection fails, exit with error
  process.exit(1)
}

// Timeout if it hangs
setTimeout(() => process.exit(1), 5000)

export {}
