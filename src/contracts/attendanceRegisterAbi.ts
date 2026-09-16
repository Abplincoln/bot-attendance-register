/**
 * ABI for AttendanceRegister smart contract.
 * Defined `as const` for strict type-checking and autocompletion with Viem and Wagmi.
 */
export const attendanceRegisterAbi = [
  {
    type: 'event',
    name: 'EventCreated',
    inputs: [
      { name: 'eventId', type: 'uint256', indexed: true, internalType: 'uint256' },
      { name: 'organizer', type: 'address', indexed: true, internalType: 'address' },
      { name: 'name', type: 'string', indexed: false, internalType: 'string' }
    ],
    anonymous: false
  },
  {
    type: 'event',
    name: 'AttendanceRecorded',
    inputs: [
      { name: 'eventId', type: 'uint256', indexed: true, internalType: 'uint256' },
      { name: 'attendee', type: 'address', indexed: true, internalType: 'address' },
      { name: 'timestamp', type: 'uint256', indexed: false, internalType: 'uint256' }
    ],
    anonymous: false
  },
  {
    type: 'function',
    name: 'createEvent',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'name', type: 'string', internalType: 'string' },
      { name: 'startTime', type: 'uint256', internalType: 'uint256' },
      { name: 'endTime', type: 'uint256', internalType: 'uint256' }
    ],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }]
  },
  {
    type: 'function',
    name: 'checkIn',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'eventId', type: 'uint256', internalType: 'uint256' }],
    outputs: []
  },
  {
    type: 'function',
    name: 'getEvent',
    stateMutability: 'view',
    inputs: [{ name: 'eventId', type: 'uint256', internalType: 'uint256' }],
    outputs: [
      { name: 'id', type: 'uint256', internalType: 'uint256' },
      { name: 'organizer', type: 'address', internalType: 'address' },
      { name: 'name', type: 'string', internalType: 'string' },
      { name: 'startTime', type: 'uint256', internalType: 'uint256' },
      { name: 'endTime', type: 'uint256', internalType: 'uint256' },
      { name: 'attendeeCount', type: 'uint256', internalType: 'uint256' }
    ]
  },
  {
    type: 'function',
    name: 'getAttendees',
    stateMutability: 'view',
    inputs: [{ name: 'eventId', type: 'uint256', internalType: 'uint256' }],
    outputs: [{ name: '', type: 'address[]', internalType: 'address[]' }]
  },
  {
    type: 'function',
    name: 'getAttendeeCount',
    stateMutability: 'view',
    inputs: [{ name: 'eventId', type: 'uint256', internalType: 'uint256' }],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }]
  },
  {
    type: 'function',
    name: 'hasAttended',
    stateMutability: 'view',
    inputs: [
      { name: 'eventId', type: 'uint256', internalType: 'uint256' },
      { name: 'attendee', type: 'address', internalType: 'address' }
    ],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }]
  },
  {
    type: 'function',
    name: 'events',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    outputs: [
      { name: 'id', type: 'uint256', internalType: 'uint256' },
      { name: 'organizer', type: 'address', internalType: 'address' },
      { name: 'name', type: 'string', internalType: 'string' },
      { name: 'startTime', type: 'uint256', internalType: 'uint256' },
      { name: 'endTime', type: 'uint256', internalType: 'uint256' },
      { name: 'attendeeCount', type: 'uint256', internalType: 'uint256' }
    ]
  },
  {
    type: 'function',
    name: 'nextEventId',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }]
  }
] as const
