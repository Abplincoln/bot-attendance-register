import { createWalletClient, createPublicClient, http, defineChain } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

// Attempt to load .env if present
try {
  process.loadEnvFile(path.join(rootDir, '.env'))
} catch {
  // Ignore if .env is missing, will fall back to environment variables
}

// Define BOT Chain Testnet for Viem
const botChainTestnet = defineChain({
  id: 968,
  name: 'BOT Chain Testnet',
  nativeCurrency: {
    name: 'BOT',
    symbol: 'BOT',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.bohr.life'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BOHR Scan',
      url: 'https://scan.bohr.life',
    },
  },
  testnet: true,
})

async function main() {
  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) {
    console.error('Error: PRIVATE_KEY environment variable is not set.')
    console.error('Please add your private key to a .env file: PRIVATE_KEY=0x...')
    process.exit(1)
  }

  const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`
  const account = privateKeyToAccount(formattedKey)

  console.log(`Using deployer account: ${account.address}`)

  const publicClient = createPublicClient({
    chain: botChainTestnet,
    transport: http('https://rpc.bohr.life'),
  })

  const balance = await publicClient.getBalance({ address: account.address })
  console.log(`Deployer balance: ${balance} wei`)

  if (balance === 0n) {
    console.error('Error: Deployer account has 0 BOT balance on BOT Chain Testnet. Please fund the account with testnet gas tokens first.')
    process.exit(1)
  }

  const walletClient = createWalletClient({
    account,
    chain: botChainTestnet,
    transport: http('https://rpc.bohr.life'),
  })

  // Read ABI and Bytecode
  const binPath = path.join(rootDir, 'artifacts', 'src_contracts_AttendanceRegister_sol_AttendanceRegister.bin')
  const abiPath = path.join(rootDir, 'artifacts', 'src_contracts_AttendanceRegister_sol_AttendanceRegister.abi')

  const bytecode = fs.readFileSync(binPath, 'utf8').trim()
  const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'))

  console.log('Sending deployment transaction to BOT Chain Testnet...')

  const hash = await walletClient.deployContract({
    abi,
    bytecode: `0x${bytecode}`,
  })

  console.log(`Transaction Hash: ${hash}`)
  console.log(`Explorer Transaction Link: https://scan.bohr.life/tx/${hash}`)
  console.log('Waiting for transaction confirmation...')

  const receipt = await publicClient.waitForTransactionReceipt({ hash })

  if (receipt.status === 'reverted') {
    console.error('Deployment transaction failed (reverted).')
    process.exit(1)
  }

  const contractAddress = receipt.contractAddress
  console.log('----------------------------------------------------')
  console.log('SUCCESS! AttendanceRegister deployed successfully!')
  console.log(`Deployed Contract Address: ${contractAddress}`)
  console.log(`Explorer Contract Link: https://scan.bohr.life/address/${contractAddress}`)
  console.log(`Block Number: ${receipt.blockNumber}`)
  console.log('----------------------------------------------------')

  // Update src/config.ts with the deployed contract address
  const configPath = path.join(rootDir, 'src', 'config.ts')
  let configContent = fs.readFileSync(configPath, 'utf8')

  if (configContent.includes('export const attendanceRegisterAddress =')) {
    configContent = configContent.replace(
      /export const attendanceRegisterAddress = '0x[a-fA-F0-9]*' as const/,
      `export const attendanceRegisterAddress = '${contractAddress}' as const`
    )
  } else {
    configContent += `\n// Deployed AttendanceRegister contract address on BOT Chain Testnet\nexport const attendanceRegisterAddress = '${contractAddress}' as const\n`
  }

  fs.writeFileSync(configPath, configContent, 'utf8')
  console.log(`Updated ${configPath} with contract address: ${contractAddress}`)
}

main().catch((err) => {
  console.error('Deployment error:', err)
  process.exit(1)
})
