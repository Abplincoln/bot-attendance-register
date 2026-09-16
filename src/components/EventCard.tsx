import { useState, useEffect } from 'react'
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { attendanceRegisterAddress } from '../config'
import { attendanceRegisterAbi } from '../contracts/attendanceRegisterAbi'

interface EventCardProps {
  eventId: bigint
  currentAddress?: `0x${string}`
  onCheckInSuccess?: () => void
}

function truncateAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function formatDate(timestampSec: bigint): string {
  const date = new Date(Number(timestampSec) * 1000)
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function EventCard({
  eventId,
  currentAddress,
  onCheckInSuccess,
}: EventCardProps) {
  const [showAttendees, setShowAttendees] = useState(false)
  const [nowSec, setNowSec] = useState(() => BigInt(Math.floor(Date.now() / 1000)))

  // Keep timestamp fresh for status countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setNowSec(BigInt(Math.floor(Date.now() / 1000)))
    }, 10000)
    return () => clearInterval(timer)
  }, [])

  // Read event details
  const {
    data: eventData,
    isLoading: isLoadingEvent,
    refetch: refetchEvent,
  } = useReadContract({
    address: attendanceRegisterAddress,
    abi: attendanceRegisterAbi,
    functionName: 'getEvent',
    args: [eventId],
  })

  // Read check-in status for current connected user
  const {
    data: hasAttended,
    refetch: refetchHasAttended,
  } = useReadContract({
    address: attendanceRegisterAddress,
    abi: attendanceRegisterAbi,
    functionName: 'hasAttended',
    args: currentAddress ? [eventId, currentAddress] : undefined,
    query: {
      enabled: Boolean(currentAddress),
    },
  })

  // Read attendee list (only when drawer is expanded or count updates)
  const {
    data: attendeesList,
    refetch: refetchAttendees,
  } = useReadContract({
    address: attendanceRegisterAddress,
    abi: attendanceRegisterAbi,
    functionName: 'getAttendees',
    args: [eventId],
    query: {
      enabled: showAttendees,
    },
  })

  // Write contract hook for check-in
  const {
    data: checkInHash,
    isPending: isCheckInPending,
    error: checkInError,
    writeContract,
  } = useWriteContract()

  const {
    isLoading: isCheckInConfirming,
    isSuccess: isCheckInConfirmed,
  } = useWaitForTransactionReceipt({
    hash: checkInHash,
  })

  useEffect(() => {
    if (isCheckInConfirmed) {
      refetchEvent()
      refetchHasAttended()
      refetchAttendees()
      onCheckInSuccess?.()
    }
  }, [isCheckInConfirmed, refetchEvent, refetchHasAttended, refetchAttendees, onCheckInSuccess])

  if (isLoadingEvent || !eventData) {
    return (
      <div className="card" style={{ padding: '20px', color: 'var(--text-secondary)' }}>
        Loading event #{eventId.toString()}...
      </div>
    )
  }

  const [id, organizer, name, startTime, endTime, attendeeCount] = eventData

  // Determine event timing state
  const isUpcoming = nowSec < startTime
  const isActive = nowSec >= startTime && nowSec <= endTime
  const isEnded = nowSec > endTime

  const handleCheckIn = () => {
    writeContract({
      address: attendanceRegisterAddress,
      abi: attendanceRegisterAbi,
      functionName: 'checkIn',
      args: [eventId],
    })
  }

  return (
    <div className="card">
      <div className="event-card-header">
        <div>
          <h3 className="event-name">
            {name}
            <span className="event-id">#{id.toString()}</span>
          </h3>
        </div>

        <div>
          {isUpcoming && (
            <span className="status-badge badge-upcoming">
              🟡 Upcoming
            </span>
          )}
          {isActive && (
            <span className="status-badge badge-active">
              🟢 Active
            </span>
          )}
          {isEnded && (
            <span className="status-badge badge-ended">
              🔴 Ended
            </span>
          )}
        </div>
      </div>

      <div className="event-meta-grid">
        <div className="meta-item">
          <span className="meta-label">Time Window</span>
          <span className="meta-value">
            {formatDate(startTime)} – {formatDate(endTime)}
          </span>
        </div>

        <div className="meta-item">
          <span className="meta-label">Total Attendees</span>
          <span className="meta-value">{attendeeCount.toString()} checked in</span>
        </div>

        <div className="meta-item">
          <span className="meta-label">Organizer</span>
          <a
            href={`https://scan.bohr.life/address/${organizer}`}
            target="_blank"
            rel="noreferrer"
            className="meta-value"
            style={{ fontFamily: 'var(--font-mono)', textDecoration: 'underline' }}
          >
            {truncateAddress(organizer)}
          </a>
        </div>
      </div>

      <div className="event-footer">
        <div>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowAttendees(!showAttendees)}
          >
            {showAttendees ? 'Hide Attendees' : `View Attendees (${attendeeCount.toString()})`}
          </button>
        </div>

        <div>
          {!currentAddress ? (
            <button type="button" className="btn-primary" disabled>
              Connect Wallet to Check In
            </button>
          ) : hasAttended ? (
            <button
              type="button"
              className="btn-primary"
              disabled
              style={{ background: '#059669', opacity: 0.9, cursor: 'default' }}
            >
              ✓ Already Checked In
            </button>
          ) : isUpcoming ? (
            <button type="button" className="btn-primary" disabled>
              Check-In Not Started
            </button>
          ) : isEnded ? (
            <button type="button" className="btn-primary" disabled>
              Event Closed
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              onClick={handleCheckIn}
              disabled={isCheckInPending || isCheckInConfirming}
            >
              {isCheckInPending
                ? 'Confirm in Wallet...'
                : isCheckInConfirming
                ? 'Checking In...'
                : 'Check In'}
            </button>
          )}
        </div>
      </div>

      {checkInError && (
        <div className="notice-box notice-error">
          <span>Check-in error: {checkInError.message.split('\n')[0]}</span>
        </div>
      )}

      {checkInHash && !isCheckInConfirmed && (
        <div className="notice-box notice-info">
          <span>Recording check-in on BOT Chain...</span>
          <a
            href={`https://scan.bohr.life/tx/${checkInHash}`}
            target="_blank"
            rel="noreferrer"
            className="notice-link"
          >
            View on Explorer
          </a>
        </div>
      )}

      {isCheckInConfirmed && checkInHash && (
        <div className="notice-box notice-success">
          <span>You have successfully checked into this event!</span>
          <a
            href={`https://scan.bohr.life/tx/${checkInHash}`}
            target="_blank"
            rel="noreferrer"
            className="notice-link"
          >
            View Receipt
          </a>
        </div>
      )}

      {showAttendees && (
        <div className="attendee-drawer">
          <span className="meta-label">Verified Attendee Roster</span>
          {attendeesList && attendeesList.length > 0 ? (
            <div className="attendee-list">
              {attendeesList.map((addr, idx) => (
                <a
                  key={`${addr}-${idx}`}
                  href={`https://scan.bohr.life/address/${addr}`}
                  target="_blank"
                  rel="noreferrer"
                  className="attendee-chip"
                  title={addr}
                >
                  <span>{truncateAddress(addr)}</span>
                </a>
              ))}
            </div>
          ) : (
            <p className="attendee-empty">No attendees have checked in yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
