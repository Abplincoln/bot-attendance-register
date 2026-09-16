import { createPublicClient, http, defineChain, formatEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

try {
  process.loadEnvFile(path.join(rootDir, '.env'))
} catch {
  console.error('Error: Could not load .env file.')
  process.exit(1)
}

const privateKey = process.env.PRIVATE_KEY
if (!privateKey) {
  console.error('Error: PRIVATE_KEY not found in .env.')
  process.exit(1)
}

try {
  const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`
  const account = privateKeyToAccount(formattedKey)

  const botChainTestnet = defineChain({
    id: 968,
    name: 'BOT Chain Testnet',
    nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
    rpcUrls: { default: { http: ['https://rpc.bohr.life'] } },
    testnet: true,
  })

  const client = createPublicClient({
    chain: botChainTestnet,
    transport: http('https://rpc.bohr.life'),
  })

  const balanceWei = await client.getBalance({ address: account.address })
  const balanceBot = formatEther(balanceWei)

  console.log(`Public Address: ${account.address}`)
  console.log(`Balance: ${balanceBot} BOT (${balanceWei.toString()} wei)`)
} catch (err) {
  console.error('Error checking balance:', err.message || 'Unknown error')
  process.exit(1)
}
