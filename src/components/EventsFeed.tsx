import { useReadContract } from 'wagmi'
import { attendanceRegisterAddress } from '../config'
import { attendanceRegisterAbi } from '../contracts/attendanceRegisterAbi'
import { EventCard } from './EventCard'

interface EventsFeedProps {
  currentAddress?: `0x${string}`
  refreshKey: number
  onRefresh: () => void
}

export function EventsFeed({
  currentAddress,
  refreshKey,
  onRefresh,
}: EventsFeedProps) {
  const {
    data: nextEventId,
    isLoading,
    refetch,
  } = useReadContract({
    address: attendanceRegisterAddress,
    abi: attendanceRegisterAbi,
    functionName: 'nextEventId',
  })

  // nextEventId starts at 1. If nextEventId is 1, no events exist.
  // If nextEventId is 4, events 1, 2, 3 exist.
  const totalEvents = nextEventId ? Number(nextEventId) - 1 : 0

  const eventIds: bigint[] = []
  if (totalEvents > 0) {
    for (let i = totalEvents; i >= 1; i--) {
      eventIds.push(BigInt(i))
    }
  }

  const handleManualRefresh = () => {
    refetch()
    onRefresh()
  }

  return (
    <section>
      <div className="feed-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 className="feed-title">Registered Events</h2>
          <span
            style={{
              fontSize: '13px',
              padding: '2px 8px',
              borderRadius: '9999px',
              background: 'rgba(0, 0, 0, 0.05)',
              color: 'var(--text-secondary)',
              fontWeight: 600,
            }}
          >
            {totalEvents}
          </span>
        </div>

        <button
          type="button"
          className="btn-secondary"
          onClick={handleManualRefresh}
          title="Refresh feed"
        >
          ↻ Refresh Feed
        </button>
      </div>

      {isLoading ? (
        <div className="empty-state">
          <p className="empty-state-title">Loading events from BOT Chain...</p>
          <p className="empty-state-desc">Fetching contract data.</p>
        </div>
      ) : eventIds.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">No events registered yet</p>
          <p className="empty-state-desc">
            Be the first organizer to create an event using the form above.
          </p>
        </div>
      ) : (
        <div className="events-list" key={refreshKey}>
          {eventIds.map((id) => (
            <EventCard
              key={id.toString()}
              eventId={id}
              currentAddress={currentAddress}
              onCheckInSuccess={handleManualRefresh}
            />
          ))}
        </div>
      )}
    </section>
  )
}
