import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { defineChain } from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit/networks'

// Configure BOT Chain Testnet
export const botChainTestnet = defineChain({
  id: 968,
  caipNetworkId: 'eip155:968',
  chainNamespace: 'eip155',
  name: 'BOT Chain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'BOT',
    symbol: 'BOT',
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

// Project ID from Reown Cloud (or public test ID for development)
export const projectId =
  import.meta.env.VITE_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694'

// Configured networks
export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [botChainTestnet]

// Wagmi Adapter instance
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
})

// Application metadata
export const metadata = {
  name: 'BOT Chain dApp',
  description: 'BOT Chain Testnet dApp powered by Reown AppKit',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://botchain.net',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
}

// Deployed AttendanceRegister contract address on BOT Chain Testnet
export const attendanceRegisterAddress = '0x63605947eb32f833ea6afa94496e9f0f04352045' as const
