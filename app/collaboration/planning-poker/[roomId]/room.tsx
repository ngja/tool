"use client";

import { ReactNode } from "react";
import { RoomProvider } from "@/liveblocks.config";
import { ClientSideSuspense } from "@liveblocks/react";

export function Room({ children, roomId }: { children: ReactNode, roomId: string }) {
    return (
        <RoomProvider
            id={`planning-poker-room-${roomId}`}
            initialPresence={{
                selectedCard: null,
                name: null,
            }}
            initialStorage={{
                isRevealed: false,
            }}
        >
            <ClientSideSuspense fallback={<div className="flex items-center justify-center p-12 text-muted-foreground">Connecting to room...</div>}>
                {() => children}
            </ClientSideSuspense>
        </RoomProvider>
    );
}
