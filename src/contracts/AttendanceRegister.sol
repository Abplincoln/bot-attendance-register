// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AttendanceRegister
 * @dev A simple smart contract for creating events and recording attendee check-ins.
 * Designed for beginners: clean, direct require statements, and no complex patterns.
 */
contract AttendanceRegister {
    // Structure containing the essential on-chain data for each event
    struct Event {
        uint256 id;
        address organizer;
        string name;
        uint256 startTime;
        uint256 endTime;
        uint256 attendeeCount;
    }

    // Counter for assigning unique, sequential event IDs (starts at 1)
    uint256 public nextEventId = 1;

    // Mapping from event ID to its Event data
    mapping(uint256 => Event) public events;

    // Mapping from event ID to the list of attendee addresses
    mapping(uint256 => address[]) private eventAttendees;

    // Mapping from event ID to attendee address to check-in status (prevents double check-ins)
    mapping(uint256 => mapping(address => bool)) private attended;

    // Events emitted for off-chain indexing and frontend awareness
    event EventCreated(
        uint256 indexed eventId,
        address indexed organizer,
        string name
    );

    event AttendanceRecorded(
        uint256 indexed eventId,
        address indexed attendee,
        uint256 timestamp
    );

    /**
     * @notice Create a new event
     * @param name The title of the event
     * @param startTime Unix timestamp when check-ins open
     * @param endTime Unix timestamp when check-ins close
     * @return eventId The ID of the newly created event
     */
    function createEvent(
        string memory name,
        uint256 startTime,
        uint256 endTime
    ) external returns (uint256) {
        require(bytes(name).length > 0, "Event name cannot be empty");
        require(startTime > block.timestamp, "Start time must be in the future");
        require(endTime > startTime, "End time must be after start time");

        uint256 eventId = nextEventId;
        nextEventId++;

        events[eventId] = Event({
            id: eventId,
            organizer: msg.sender,
            name: name,
            startTime: startTime,
            endTime: endTime,
            attendeeCount: 0
        });

        emit EventCreated(eventId, msg.sender, name);

        return eventId;
    }

    /**
     * @notice Check in to an active event
     * @param eventId The ID of the event to check into
     */
    function checkIn(uint256 eventId) external {
        require(eventId > 0 && eventId < nextEventId, "Event does not exist");
        Event storage currentEvent = events[eventId];

        require(block.timestamp >= currentEvent.startTime, "Event has not started yet");
        require(block.timestamp <= currentEvent.endTime, "Event has already ended");
        require(!attended[eventId][msg.sender], "Already checked into this event");

        attended[eventId][msg.sender] = true;
        eventAttendees[eventId].push(msg.sender);
        currentEvent.attendeeCount++;

        emit AttendanceRecorded(eventId, msg.sender, block.timestamp);
    }

    /**
     * @notice Retrieve all details for a given event
     * @param eventId The ID of the event
     */
    function getEvent(uint256 eventId) external view returns (
        uint256 id,
        address organizer,
        string memory name,
        uint256 startTime,
        uint256 endTime,
        uint256 attendeeCount
    ) {
        require(eventId > 0 && eventId < nextEventId, "Event does not exist");
        Event memory currentEvent = events[eventId];

        return (
            currentEvent.id,
            currentEvent.organizer,
            currentEvent.name,
            currentEvent.startTime,
            currentEvent.endTime,
            currentEvent.attendeeCount
        );
    }

    /**
     * @notice Get the full list of wallet addresses that checked into an event
     * @param eventId The ID of the event
     */
    function getAttendees(uint256 eventId) external view returns (address[] memory) {
        require(eventId > 0 && eventId < nextEventId, "Event does not exist");
        return eventAttendees[eventId];
    }

    /**
     * @notice Get the total count of attendees for an event
     * @param eventId The ID of the event
     */
    function getAttendeeCount(uint256 eventId) external view returns (uint256) {
        require(eventId > 0 && eventId < nextEventId, "Event does not exist");
        return events[eventId].attendeeCount;
    }

    /**
     * @notice Check whether a specific wallet address has checked into an event
     * @param eventId The ID of the event
     * @param attendee The wallet address to verify
     */
    function hasAttended(uint256 eventId, address attendee) external view returns (bool) {
        require(eventId > 0 && eventId < nextEventId, "Event does not exist");
        return attended[eventId][attendee];
    }
}
