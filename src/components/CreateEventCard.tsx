import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { attendanceRegisterAddress } from '../config'
import { attendanceRegisterAbi } from '../contracts/attendanceRegisterAbi'

interface CreateEventCardProps {
  onEventCreated?: () => void
}

function getLocalDateTimeString(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  const yyyy = date.getFullYear()
  const MM = pad(date.getMonth() + 1)
  const dd = pad(date.getDate())
  const hh = pad(date.getHours())
  const mm = pad(date.getMinutes())
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`
}

export function CreateEventCard({ onEventCreated }: CreateEventCardProps) {
  const [name, setName] = useState('')
  const [startTime, setStartTime] = useState(() =>
    getLocalDateTimeString(new Date(Date.now() + 5 * 60 * 1000))
  )
  const [endTime, setEndTime] = useState(() =>
    getLocalDateTimeString(new Date(Date.now() + 2 * 60 * 60 * 1000))
  )
  const [validationError, setValidationError] = useState<string | null>(null)

  const { data: hash, isPending, error: writeError, writeContract } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (!name.trim()) {
      setValidationError('Please provide an event name.')
      return
    }

    const startTimestamp = Math.floor(new Date(startTime).getTime() / 1000)
    const endTimestamp = Math.floor(new Date(endTime).getTime() / 1000)
    const nowTimestamp = Math.floor(Date.now() / 1000)

    if (startTimestamp <= nowTimestamp) {
      setValidationError('Start time must be in the future.')
      return
    }

    if (endTimestamp <= startTimestamp) {
      setValidationError('End time must be after the start time.')
      return
    }

    writeContract({
      address: attendanceRegisterAddress,
      abi: attendanceRegisterAbi,
      functionName: 'createEvent',
      args: [name.trim(), BigInt(startTimestamp), BigInt(endTimestamp)],
    }, {
      onSuccess: () => {
        setName('')
        onEventCreated?.()
      },
    })
  }

  return (
    <div className="card">
      <h2 className="form-title">Create New Event</h2>

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="input-group">
          <label className="input-label" htmlFor="eventName">Event Name</label>
          <input
            id="eventName"
            type="text"
            className="input-field"
            placeholder="e.g. Web3 Developers Meetup"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending || isConfirming}
          />
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="startTime">Start Date & Time</label>
          <input
            id="startTime"
            type="datetime-local"
            className="input-field"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            disabled={isPending || isConfirming}
          />
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="endTime">End Date & Time</label>
          <input
            id="endTime"
            type="datetime-local"
            className="input-field"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            disabled={isPending || isConfirming}
          />
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={isPending || isConfirming}
        >
          {isPending ? 'Confirm in Wallet...' : isConfirming ? 'Publishing...' : 'Create Event'}
        </button>
      </form>

      {validationError && (
        <div className="notice-box notice-error">
          <span>{validationError}</span>
        </div>
      )}

      {writeError && (
        <div className="notice-box notice-error">
          <span>Transaction rejected or failed: {writeError.message.split('\n')[0]}</span>
        </div>
      )}

      {hash && !isConfirmed && (
        <div className="notice-box notice-info">
          <span>Publishing event to BOT Chain Testnet...</span>
          <a
            href={`https://scan.bohr.life/tx/${hash}`}
            target="_blank"
            rel="noreferrer"
            className="notice-link"
          >
            View on Explorer
          </a>
        </div>
      )}

      {isConfirmed && hash && (
        <div className="notice-box notice-success">
          <span>Event successfully created and registered on-chain!</span>
          <a
            href={`https://scan.bohr.life/tx/${hash}`}
            target="_blank"
            rel="noreferrer"
            className="notice-link"
          >
            View on BOHR Scan
          </a>
        </div>
      )}
    </div>
  )
}
