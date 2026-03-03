import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

// Check for the API key in the environment variables
const PUBLIC_API_KEY = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;

if (typeof window !== "undefined" && !PUBLIC_API_KEY?.startsWith("pk_")) {
    console.warn(
        "Liveblocks API key is missing or invalid. Please add NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY to your .env.local file."
    );
}

// Create the Liveblocks client
const client = createClient({
    publicApiKey: PUBLIC_API_KEY || "pk_dummy_key_please_replace",
});

// Configure Liveblocks types for our Planning Poker room
export type Presence = {
    selectedCard: string | null;
    name: string | null;
    // We can add cursor coordinates etc. later if we want
};

export type Storage = {
    isRevealed: boolean;
};

// Export the Typed Hooks for our React components
export const {
    useMyPresence,
    useOthers,
    useStorage,
    useMutation,
    RoomProvider,
} = createRoomContext<Presence, Storage>(client);
