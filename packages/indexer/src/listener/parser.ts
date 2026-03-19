import { BorshCoder, EventParser, Program, Idl } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { NjordEvent, NjordEventType } from "./types";

// Simplified IDL for event parsing (events section only)
// In production, this would come from the actual compiled IDL
const NJORD_IDL_EVENTS: Idl = {
  version: "0.1.0",
  name: "njord",
  address: "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS",
  metadata: {},
  instructions: [],
  accounts: [],
  events: [
    {
      name: "CampaignCreated",
      discriminator: [0, 0, 0, 0, 0, 0, 0, 1],
    },
    {
      name: "AttributionRecorded",
      discriminator: [0, 0, 0, 0, 0, 0, 0, 2],
    },
    {
      name: "BridgeRegistered",
      discriminator: [0, 0, 0, 0, 0, 0, 0, 3],
    },
    {
      name: "ChallengeCreated",
      discriminator: [0, 0, 0, 0, 0, 0, 0, 4],
    },
    {
      name: "ChallengeResolved",
      discriminator: [0, 0, 0, 0, 0, 0, 0, 5],
    },
  ],
  types: [],
};

/**
 * Parse Solana program logs to extract Njord events
 */
export class NjordEventParser {
  private programId: PublicKey;
  private eventParser: EventParser | null = null;

  constructor(programId: PublicKey) {
    this.programId = programId;

    // Initialize event parser with IDL
    try {
      const coder = new BorshCoder(NJORD_IDL_EVENTS);
      this.eventParser = new EventParser(programId, coder);
    } catch {
      // Fall back to manual parsing if IDL parsing fails
      console.warn("Event parser initialization failed, using manual parsing");
    }
  }

  /**
   * Parse events from transaction logs
   */
  parseFromLogs(
    logs: string[],
    slot: number,
    signature: string,
    blockTime: number | null
  ): NjordEvent[] {
    const events: NjordEvent[] = [];
    const timestamp = blockTime ? new Date(blockTime * 1000) : new Date();

    // Try using Anchor event parser first
    if (this.eventParser) {
      try {
        const parsed = this.eventParser.parseLogs(logs);
        for (const event of parsed) {
          const njordEvent = this.mapAnchorEvent(event, slot, signature, timestamp);
          if (njordEvent) {
            events.push(njordEvent);
          }
        }
        return events;
      } catch {
        // Fall through to manual parsing
      }
    }

    // Manual log parsing fallback
    return this.parseLogsManually(logs, slot, signature, timestamp);
  }

  /**
   * Map Anchor event to NjordEvent
   */
  private mapAnchorEvent(
    event: { name: string; data: unknown },
    slot: number,
    signature: string,
    timestamp: Date
  ): NjordEvent | null {
    const eventType = event.name as NjordEventType;
    if (!Object.values(NjordEventType).includes(eventType)) {
      return null;
    }

    return {
      type: eventType,
      slot,
      signature,
      timestamp,
      accounts: [],
      data: event.data,
    };
  }

  /**
   * Manual log parsing for when IDL parsing fails
   */
  private parseLogsManually(
    logs: string[],
    slot: number,
    signature: string,
    timestamp: Date
  ): NjordEvent[] {
    const events: NjordEvent[] = [];
    const programLog = `Program ${this.programId.toBase58()}`;

    let inProgram = false;
    let currentAccounts: string[] = [];

    for (const log of logs) {
      // Track when we're in our program's execution
      if (log.includes(`${programLog} invoke`)) {
        inProgram = true;
        currentAccounts = [];
        continue;
      }

      if (log.includes(`${programLog} success`) || log.includes(`${programLog} failed`)) {
        inProgram = false;
        continue;
      }

      if (!inProgram) continue;

      // Parse program data events (base64 encoded)
      if (log.startsWith("Program data:")) {
        const dataBase64 = log.replace("Program data:", "").trim();
        const event = this.parseEventData(dataBase64, slot, signature, timestamp, currentAccounts);
        if (event) {
          events.push(event);
        }
        continue;
      }

      // Parse structured log events
      if (log.includes("Event:")) {
        const event = this.parseStructuredLog(log, slot, signature, timestamp);
        if (event) {
          events.push(event);
        }
      }
    }

    return events;
  }

  /**
   * Parse base64 encoded event data
   */
  private parseEventData(
    dataBase64: string,
    slot: number,
    signature: string,
    timestamp: Date,
    accounts: string[]
  ): NjordEvent | null {
    try {
      const data = Buffer.from(dataBase64, "base64");

      // First 8 bytes are event discriminator
      const discriminator = data.subarray(0, 8);
      const eventData = data.subarray(8);

      // Map discriminator to event type
      const eventType = this.discriminatorToEventType(discriminator);
      if (!eventType) return null;

      // Decode event data based on type
      const decodedData = this.decodeEventData(eventType, eventData);

      return {
        type: eventType,
        slot,
        signature,
        timestamp,
        accounts,
        data: decodedData,
      };
    } catch {
      return null;
    }
  }

  /**
   * Map discriminator bytes to event type
   */
  private discriminatorToEventType(discriminator: Buffer): NjordEventType | null {
    // These would match the actual program's event discriminators
    const discHex = discriminator.toString("hex");

    const mapping: Record<string, NjordEventType> = {
      // Add actual discriminator mappings from program
    };

    return mapping[discHex] ?? null;
  }

  /**
   * Decode event data based on event type
   */
  private decodeEventData(type: NjordEventType, data: Buffer): unknown {
    // Simplified decoding - in production this would use proper Borsh deserialization
    switch (type) {
      case NjordEventType.CampaignCreated:
        return this.decodeCampaignCreated(data);
      case NjordEventType.AttributionRecorded:
        return this.decodeAttributionRecorded(data);
      case NjordEventType.BridgeRegistered:
        return this.decodeBridgeRegistered(data);
      default:
        return { raw: data.toString("hex") };
    }
  }

  private decodeCampaignCreated(data: Buffer): unknown {
    // Placeholder - would decode actual struct
    return { raw: data.toString("hex") };
  }

  private decodeAttributionRecorded(data: Buffer): unknown {
    return { raw: data.toString("hex") };
  }

  private decodeBridgeRegistered(data: Buffer): unknown {
    return { raw: data.toString("hex") };
  }

  /**
   * Parse structured log messages
   */
  private parseStructuredLog(
    log: string,
    slot: number,
    signature: string,
    timestamp: Date
  ): NjordEvent | null {
    // Parse logs like "Event: CampaignCreated { ... }"
    const match = log.match(/Event:\s*(\w+)\s*({.*})?/);
    if (!match) return null;

    const eventName = match[1];
    const eventType = eventName as NjordEventType;

    if (!Object.values(NjordEventType).includes(eventType)) {
      return null;
    }

    let data: unknown = {};
    if (match[2]) {
      try {
        data = JSON.parse(match[2]);
      } catch {
        data = { raw: match[2] };
      }
    }

    return {
      type: eventType,
      slot,
      signature,
      timestamp,
      accounts: [],
      data,
    };
  }
}
