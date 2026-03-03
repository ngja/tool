"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Layers, Plus, Users, ArrowRight } from "lucide-react"

export default function PlanningPokerLandingPage() {
    const router = useRouter()
    const [isCreating, setIsCreating] = useState(false)
    const [roomId, setRoomId] = useState("")

    const handleCreateRoom = () => {
        setIsCreating(true)
        // Generate a random 9-character room ID (similar to many meeting apps)
        const newRoomId = Math.random().toString(36).substring(2, 11)
        router.push(`/collaboration/planning-poker/${newRoomId}`)
    }

    const handleJoinRoom = (e: React.FormEvent) => {
        e.preventDefault()
        if (roomId.trim()) {
            router.push(`/collaboration/planning-poker/${roomId.trim()}`)
        }
    }

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-4xl min-h-[80vh] flex flex-col items-center justify-center">
            <div className="text-center space-y-4 mb-12">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <Layers className="w-10 h-10" />
                    </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Planning Poker</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Collaborate with your team to estimate the effort for your user stories and tasks in real-time.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
                {/* Create Room Card */}
                <Card className="flex flex-col border-2 hover:border-primary/50 transition-colors shadow-lg shadow-primary/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <Plus className="w-6 h-6 text-primary" />
                            New Room
                        </CardTitle>
                        <CardDescription className="text-base">
                            Start a new estimation session and invite your team.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-center py-8">
                        <ul className="space-y-3 text-muted-foreground mb-8 text-sm">
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/70" />
                                Independent session with unique URL
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/70" />
                                Real-time collaboration
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/70" />
                                Standard Fibonacci sequence
                            </li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full text-lg py-6 h-auto"
                            size="lg"
                            onClick={handleCreateRoom}
                            disabled={isCreating}
                        >
                            {isCreating ? "Creating Room..." : "Create Room"}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Join Room Card */}
                <Card className="flex flex-col border border-border shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <Users className="w-6 h-6 text-secondary-foreground" />
                            Join Room
                        </CardTitle>
                        <CardDescription className="text-base">
                            Enter a room code to join an existing session.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleJoinRoom} className="flex flex-col flex-1">
                        <CardContent className="flex-1 flex flex-col justify-center space-y-4 py-8">
                            <div className="space-y-2">
                                <Label htmlFor="room-id" className="text-base">Room Code or URL</Label>
                                <Input
                                    id="room-id"
                                    placeholder="e.g. x8p9q2m4"
                                    value={roomId}
                                    onChange={(e) => setRoomId(e.target.value)}
                                    className="text-lg py-6 h-auto font-mono"
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                type="submit"
                                variant="secondary"
                                className="w-full text-lg py-6 h-auto group"
                                disabled={!roomId.trim()}
                            >
                                Join Session
                                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}
