"use client"

import { useState, use, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Eye, RotateCcw } from "lucide-react"
import { triggerRandomConfetti } from "@/lib/utils/confetti"
import { Room } from "./room"
import { useMyPresence, useOthers, useStorage, useMutation } from "@/liveblocks.config"

const FIBONACCI_DECK = ["0", "1", "2", "3", "5", "8", "13", "21", "34", "55", "89", "?", "☕"]

function ClientSideRoom() {
    const [myPresence, updateMyPresence] = useMyPresence();
    const others = useOthers();
    const isRevealed = useStorage((root) => root.isRevealed);
    const [nameInput, setNameInput] = useState("");
    const [hasCheckedStorage, setHasCheckedStorage] = useState(false);

    useEffect(() => {
        if (!hasCheckedStorage) {
            const savedName = localStorage.getItem("planning-poker-name");
            if (savedName) {
                updateMyPresence({ name: savedName });
            }
            setHasCheckedStorage(true);
        }
    }, [hasCheckedStorage, updateMyPresence]);

    // We don't prompt until connection is established and we know name is null
    const needsName = myPresence.name === null && hasCheckedStorage;

    const handleCardClick = (card: string) => {
        if (isRevealed) return;
        updateMyPresence({ selectedCard: card });
    }

    const handleReveal = useMutation(({ storage }) => {
        storage.set("isRevealed", true);
    }, []);

    const handleNextRound = useMutation(({ storage }) => {
        storage.set("isRevealed", false);
    }, []);

    // Clear selected cards for ALL connected users when a new round starts.
    // Instead of only the user who clicked "Next Round" clearing their own presence,
    // we react to the global state change of `isRevealed` becoming `false`.
    useEffect(() => {
        if (isRevealed === false) {
            updateMyPresence({ selectedCard: null });
        }
    }, [isRevealed, updateMyPresence]);

    // Derived state
    const selectedCard = myPresence.selectedCard;

    const allSelectedCards = [
        selectedCard,
        ...others.map((o) => o.presence.selectedCard),
    ].filter(Boolean) as string[];

    const numericCards = allSelectedCards.filter((card) => !isNaN(Number(card)));
    const average = numericCards.length > 0
        ? (numericCards.reduce((acc, curr) => acc + Number(curr), 0) / numericCards.length).toFixed(1)
        : null;

    const cardCounts = allSelectedCards.reduce((acc, card) => {
        acc[card] = (acc[card] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Unanimous Vote Easter Egg
    useEffect(() => {
        if (isRevealed && Object.keys(cardCounts).length === 1 && allSelectedCards.length > 1) {
            const cleanup = triggerRandomConfetti();
            return cleanup;
        }
    }, [isRevealed, cardCounts, allSelectedCards.length]);

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (nameInput.trim()) {
            const name = nameInput.trim();
            localStorage.setItem("planning-poker-name", name);
            updateMyPresence({ name });
        }
    };

    if (needsName) {
        return (
            <Dialog open={needsName}>
                <DialogContent className="sm:max-w-md" showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle>Welcome to Planning Poker</DialogTitle>
                        <DialogDescription>
                            Please enter your name to join the session.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleJoin} className="flex items-center space-x-2">
                        <div className="grid flex-1 gap-2">
                            <Input
                                id="name"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                placeholder="Enter your name"
                                autoFocus
                            />
                        </div>
                        <Button type="submit" disabled={!nameInput.trim()}>
                            Join
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-5xl space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Planning Poker</h1>
                <p className="text-muted-foreground flex items-center justify-between">
                    <span>Select a card to estimate the effort. Reveal when ready.</span>
                    <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                        {others.length + 1} User(s) in Room
                    </span>
                </p>
            </div>

            <div className="flex flex-col gap-8">
                {/* Play Area */}
                <div className="space-y-4">
                    {/* Action Buttons Header */}
                    <div className="flex gap-4 p-4 bg-muted/30 rounded-xl justify-between items-center min-h-[72px]">
                        <div className="flex-1 flex items-center gap-6 overflow-x-auto">
                            {isRevealed && allSelectedCards.length > 0 && (
                                <>
                                    {average !== null && (
                                        <div className="flex flex-col shrink-0">
                                            <span className="text-muted-foreground text-xs uppercase font-semibold tracking-wider">Average</span>
                                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">{average}</span>
                                        </div>
                                    )}
                                    <div className={`flex gap-2 items-center flex-wrap ${average !== null ? 'border-l pl-6' : ''}`}>
                                        {Object.entries(cardCounts)
                                            .sort((a, b) => b[1] - a[1])
                                            .map(([card, count]) => (
                                                <div key={card} className="flex items-center bg-background rounded-md border shadow-sm overflow-hidden shrink-0">
                                                    <div className="bg-primary/10 text-primary px-3 py-1 font-bold border-r">{card}</div>
                                                    <div className="px-3 py-1 text-muted-foreground font-medium text-sm">
                                                        {count} {count === 1 ? 'vote' : 'votes'}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </>
                            )}
                            {isRevealed && allSelectedCards.length === 0 && (
                                <span className="text-muted-foreground text-sm font-medium">No cards were selected this round.</span>
                            )}
                        </div>
                        <Button
                            onClick={isRevealed ? handleNextRound : handleReveal}
                            disabled={!isRevealed && others.every(o => !o.presence.selectedCard) && !selectedCard}
                            className="w-32"
                            variant={isRevealed ? "outline" : "default"}
                        >
                            {isRevealed ? (
                                <>
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Next Round
                                </>
                            ) : (
                                <>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Reveal
                                </>
                            )}
                        </Button>
                    </div>

                    <Card className="p-8 min-h-[400px] border-dashed grid grid-cols-2 md:grid-cols-3 gap-6 place-items-center bg-muted/10">
                        {/* Render My Card */}
                        <div className="flex flex-col items-center gap-2">
                            <div
                                className={`w-32 h-48 rounded-xl border-4 flex items-center justify-center transition-all duration-500 transform ${!selectedCard ? "border-dashed border-muted-foreground/30" :
                                    isRevealed ? "rotate-y-0 bg-primary border-primary text-primary-foreground shadow-xl" : "rotate-y-180 bg-muted border-border shadow-md"
                                    }`}
                                style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
                            >
                                {selectedCard ? (
                                    <>
                                        <div className={`text-5xl font-bold transition-opacity duration-300 ${isRevealed ? 'opacity-100' : 'opacity-0'}`}>
                                            {selectedCard}
                                        </div>
                                        {!isRevealed && (
                                            <div className="absolute inset-0 flex items-center justify-center opacity-100 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CgkJPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJ0cmFuc3BhcmVudCI+PC9yZWN0PgoJCTxwYXRoIGQ9Ik0wIDIwIEwyMCA0MCBMNDAgMjAgTDIwIDAgWiIgZmlsbD0icmdiYSg1MCw1MCw1MCwwLjEpIj48L3BhdGg+Cgk8L3N2Z24=')] rounded-lg [transform:rotateY(180deg)]">
                                                <span className="text-muted-foreground font-semibold text-sm">SELECTED</span>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    isRevealed ? (
                                        <div className="flex flex-col items-center gap-2 opacity-50">
                                            <span className="text-3xl">🫥</span>
                                            <p className="text-muted-foreground text-sm font-medium">Not Selected</p>
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-sm font-medium">Waiting</p>
                                    )
                                )}
                            </div>
                            <span className="font-medium text-sm">{myPresence.name || "You"}</span>
                        </div>

                        {/* Render Other Users' Cards */}
                        {others.map((other) => {
                            const hasSelected = !!other.presence.selectedCard;
                            return (
                                <div key={other.connectionId} className="flex flex-col items-center gap-2">
                                    <div
                                        className={`w-32 h-48 rounded-xl border-4 flex items-center justify-center transition-all duration-500 transform ${!hasSelected ? "border-dashed border-muted-foreground/30" :
                                            isRevealed ? "rotate-y-0 bg-secondary border-secondary-foreground/20 text-secondary-foreground shadow-xl" : "rotate-y-180 bg-muted border-border shadow-md"
                                            }`}
                                        style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
                                    >
                                        {hasSelected ? (
                                            <>
                                                <div className={`text-5xl font-bold transition-opacity duration-300 ${isRevealed ? 'opacity-100' : 'opacity-0'}`}>
                                                    {other.presence.selectedCard}
                                                </div>
                                                {!isRevealed && (
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-100 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CgkJPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJ0cmFuc3BhcmVudCI+PC9yZWN0PgoJCTxwYXRoIGQ9Ik0wIDIwIEwyMCA0MCBMNDAgMjAgTDIwIDAgWiIgZmlsbD0icmdiYSg1MCw1MCw1MCwwLjEpIj48L3BhdGg+Cgk8L3N2Zz4=')] rounded-lg [transform:rotateY(180deg)]">
                                                        <span className="text-muted-foreground font-semibold text-sm">SELECTED</span>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            isRevealed ? (
                                                <div className="flex flex-col items-center gap-2 opacity-50">
                                                    <span className="text-3xl">🫥</span>
                                                    <p className="text-muted-foreground text-sm font-medium">Not Selected</p>
                                                </div>
                                            ) : (
                                                <p className="text-muted-foreground text-sm font-medium">Waiting</p>
                                            )
                                        )}
                                    </div>
                                    <span className="font-medium text-sm text-muted-foreground">{other.presence.name || `User ${other.connectionId}`}</span>
                                </div>
                            )
                        })}

                        {others.length === 0 && (
                            <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center text-muted-foreground opacity-50 p-8 text-center border-2 border-dashed rounded-xl h-full w-full max-w-[200px]">
                                <p className="text-sm">Waiting for others to join...</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Deck Area - Now constrained and below the play area */}
                <div className="flex flex-col max-w-3xl mx-auto w-full">
                    <h3 className="text-lg font-semibold mb-4 text-center md:text-left">Card Deck</h3>
                    <Card className="flex-1 p-6 bg-muted/30">
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            {FIBONACCI_DECK.map((card) => {
                                const isSelected = selectedCard === card
                                return (
                                    <button
                                        key={card}
                                        onClick={() => handleCardClick(card)}
                                        disabled={isRevealed === true}
                                        className={`
                                            relative group h-24 w-16 md:h-32 md:w-20 lg:h-36 lg:w-24 rounded-lg border-2 flex items-center justify-center text-xl md:text-2xl font-bold transition-all flex-shrink-0
                                            ${isSelected
                                                ? "border-primary bg-primary/10 text-primary -translate-y-2 shadow-md"
                                                : "border-border bg-card hover:border-primary/50 hover:-translate-y-1 hover:shadow-sm"
                                            }
                                            ${isRevealed ? "opacity-50 cursor-not-allowed transform-none" : "cursor-pointer"}
                                        `}
                                    >
                                        {card}
                                    </button>
                                )
                            })}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default function PlanningPokerPage({ params }: { params: Promise<{ roomId: string }> }) {
    const { roomId } = use(params)

    return (
        <Room roomId={roomId}>
            <ClientSideRoom />
        </Room>
    )
}
