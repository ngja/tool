"use client"

import { useState, use, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Eye, RotateCcw, Bell } from "lucide-react"
import { triggerRandomConfetti } from "@/lib/utils/confetti"
import { Room } from "./room"
import { useMyPresence, useOthers, useStorage, useMutation, useBroadcastEvent, useEventListener } from "@/liveblocks.config"

const FIBONACCI_DECK = ["0.5", "1", "2", "3", "4", "5", "6", "7", "?", "☕"]

function ClientSideRoom() {
    const [myPresence, updateMyPresence] = useMyPresence();
    const others = useOthers();
    const isRevealed = useStorage((root) => root.isRevealed);
    const broadcast = useBroadcastEvent();
    const [nameInput, setNameInput] = useState("");
    const [hasCheckedStorage, setHasCheckedStorage] = useState(false);
    const [isDeckHidden, setIsDeckHidden] = useState(false);
    const [showNudgeToast, setShowNudgeToast] = useState(false);

    useEventListener(({ event }) => {
        if (event.type === "NUDGE") {
            const hasVoted = !!myPresence.selectedCard;
            if (!hasVoted && !isRevealed) {
                setShowNudgeToast(true);
                setTimeout(() => setShowNudgeToast(false), 4000);
            }
        }
    });

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
        setIsDeckHidden(true);
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
            setIsDeckHidden(false);
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
        <div className="container mx-auto p-4 md:p-8 max-w-5xl flex flex-col min-h-[calc(100vh-5rem)]">
            {/* Nudge Toast Notification */}
            {showNudgeToast && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-orange-500 text-white px-5 sm:px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300">
                    <Bell className="w-5 h-5 animate-bounce" />
                    <span className="font-semibold text-sm sm:text-base whitespace-nowrap">누군가 당신의 투표를 기다리고 있어요!</span>
                </div>
            )}
            <div className="flex-1 space-y-8 pb-8">
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
                        <div className="flex gap-4 p-4 bg-muted/30 rounded-xl justify-between items-center h-[88px] md:h-[96px]">
                            <div className="flex-1 flex items-center gap-6 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                {isRevealed && allSelectedCards.length > 0 && (
                                    <div className="flex items-center gap-4 md:gap-6 animate-in fade-in slide-in-from-left-4 duration-500 ease-out fill-mode-both">
                                        {average !== null && (
                                            <div className="flex flex-col shrink-0">
                                                <span className="text-muted-foreground text-xs uppercase font-semibold tracking-wider">Average</span>
                                                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 leading-none">{average}</span>
                                            </div>
                                        )}
                                        <div className={`flex gap-2 items-center flex-nowrap ${average !== null ? 'border-l pl-4 md:pl-6 border-border/60' : ''}`}>
                                            {Object.entries(cardCounts)
                                                .sort((a, b) => b[1] - a[1])
                                                .map(([card, count]) => (
                                                    <div key={card} className="flex items-center bg-background rounded-md border shadow-sm overflow-hidden shrink-0">
                                                        <div className="bg-primary/10 text-primary px-2 md:px-3 py-1 font-bold border-r">{card}</div>
                                                        <div className="px-2 md:px-3 py-1 text-muted-foreground font-medium text-xs md:text-sm whitespace-nowrap">
                                                            {count} {count === 1 ? 'vote' : 'votes'}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}
                                {isRevealed && allSelectedCards.length === 0 && (
                                    <span className="text-muted-foreground text-sm font-medium animate-in fade-in slide-in-from-left-4 duration-500 ease-out">No cards were selected this round.</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {!isRevealed && others.some(o => !o.presence.selectedCard) && (
                                    <Button
                                        onClick={() => broadcast({ type: "NUDGE" })}
                                        variant="outline"
                                        className="text-orange-500 border-orange-500/50 hover:bg-orange-500 hover:border-orange-500 hover:text-white transition-all bg-orange-500/10 sm:bg-transparent"
                                    >
                                        <Bell className="w-4 h-4 sm:mr-2" />
                                        <span className="hidden sm:inline font-medium">Please</span>
                                    </Button>
                                )}
                                <Button
                                    onClick={isRevealed ? handleNextRound : handleReveal}
                                    disabled={!isRevealed && others.every(o => !o.presence.selectedCard) && !selectedCard}
                                    className="sm:w-32 shadow-md hover:shadow-lg transition-all"
                                    variant={isRevealed ? "outline" : "default"}
                                >
                                    {isRevealed ? (
                                        <>
                                            <RotateCcw className="w-4 h-4 mr-1 sm:mr-2" />
                                            <span className="hidden sm:inline font-medium">Next</span>
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="w-4 h-4 mr-1 sm:mr-2" />
                                            <span className="hidden sm:inline font-medium">Reveal</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        <Card className="p-6 md:p-8 min-h-[400px] max-h-[60vh] overflow-y-auto border-dashed grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 items-start justify-items-center content-start bg-muted/10">
                            {/* Render My Card */}
                            <div className="flex flex-col items-center gap-2">
                                <div
                                    className={`w-32 h-48 rounded-xl border-4 flex items-center justify-center transition-all duration-500 transform ${!selectedCard ? "border-dashed border-muted-foreground/30" :
                                        isRevealed ? "rotate-y-0 bg-secondary border-secondary-foreground/20 text-primary shadow-xl" : "rotate-y-180 bg-muted border-border shadow-md"
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

                </div>
            </div>

            {/* Deck Area - Sticky to bottom */}
            <div className="sticky bottom-0 md:bottom-6 w-full bg-background/80 backdrop-blur-md border-t md:border border-border/50 md:rounded-2xl z-50 p-2 pt-1 sm:p-4 sm:pt-2 shadow-[0_-10px_40px_-20px_rgba(0,0,0,0.1)] pb-safe transition-all overflow-hidden">
                {isDeckHidden && selectedCard && !isRevealed ? (
                    <div key="hidden-state" className="flex flex-col w-full animate-in fade-in zoom-in-95 duration-300 ease-out fill-mode-both">
                        <div className="flex px-2 pt-3 sm:pt-4 pb-2 sm:pb-0">
                            <div
                                className="w-full h-16 sm:h-20 md:h-24 lg:h-28 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/10 rounded-xl transition-all border-2 border-dashed border-primary/40 bg-primary/5"
                                onClick={() => setIsDeckHidden(false)}
                            >
                                <div className="flex items-center gap-2 text-primary">
                                    <span className="text-xl sm:text-2xl">🔒</span>
                                    <span className="font-semibold text-sm sm:text-base md:text-lg">Card Selected & Hidden</span>
                                </div>
                                <p className="text-xs md:text-sm text-muted-foreground mt-1 text-center hidden md:block">Your choice is hidden to protect against screen sharing. Click here to change your card.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div key="visible-state" className="flex flex-col w-full animate-in fade-in zoom-in-95 duration-300 ease-out fill-mode-both">
                        <div className="flex flex-nowrap sm:flex-wrap items-center justify-start sm:justify-center gap-2 overflow-x-auto px-2 pt-3 sm:pt-4 pb-2 sm:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {FIBONACCI_DECK.map((card) => {
                                const isSelected = selectedCard === card
                                return (
                                    <button
                                        key={card}
                                        onClick={() => handleCardClick(card)}
                                        disabled={isRevealed === true}
                                        className={`
                                        relative group h-16 w-12 sm:h-20 sm:w-14 md:h-24 md:w-16 lg:h-28 lg:w-20 rounded-lg border-2 flex items-center justify-center text-lg md:text-2xl font-bold transition-transform flex-shrink-0
                                        ${isSelected
                                                ? "border-primary bg-primary/10 text-primary -translate-y-1 sm:-translate-y-2 shadow-md"
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
                    </div>
                )}
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
