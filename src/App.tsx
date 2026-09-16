import { useState } from 'react'
import { createAppKit, useAppKitAccount } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  projectId,
  networks,
  wagmiAdapter,
  metadata,
  botChainTestnet,
  attendanceRegisterAddress,
} from './config'
import { Header } from './components/Header'
import { CreateEventCard } from './components/CreateEventCard'
import { EventsFeed } from './components/EventsFeed'
import './App.css'

// Create TanStack Query client for caching blockchain state
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 10_000,
    },
  },
})

// Initialize Reown AppKit at module level (runs once on import)
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  defaultNetwork: botChainTestnet,
  features: {
    analytics: true,
  },
})

function MainApp() {
  const { address } = useAppKitAccount()
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        <div className="section-header">
          <h2 className="section-title">Decentralized Event Attendance</h2>
          <p className="section-subtitle">
            Create verifiable on-chain events and check in with your wallet on BOT Chain Testnet.
          </p>
        </div>

        {/* Section 1: Create Event Form */}
        <CreateEventCard onEventCreated={handleRefresh} />

        {/* Section 2: Live Events Feed & Check-In Action */}
        <EventsFeed
          currentAddress={address as `0x${string}` | undefined}
          refreshKey={refreshKey}
          onRefresh={handleRefresh}
        />

        {/* Subtle Footer with Explorer Link */}
        <footer
          style={{
            marginTop: '32px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            color: 'var(--text-tertiary)',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            Contract:{' '}
            <a
              href={`https://scan.bohr.life/address/${attendanceRegisterAddress}`}
              target="_blank"
              rel="noreferrer"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-secondary)',
                textDecoration: 'underline',
              }}
            >
              {attendanceRegisterAddress}
            </a>
          </div>

          <div>
            Powered by <strong>BOT Chain Testnet</strong> (Chain ID 968)
          </div>
        </footer>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <MainApp />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
