"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Dices, Plus, Trash2, Play } from "lucide-react"

type RouletteItem = {
  id: string
  text: string
  color: string
}

const COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A",
  "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2",
  "#F8B739", "#52B788", "#E63946", "#A8DADC"
]

export default function RoulettePage() {
  const [items, setItems] = useState<RouletteItem[]>([
    { id: "1", text: "항목 1", color: COLORS[0] },
    { id: "2", text: "항목 2", color: COLORS[1] },
    { id: "3", text: "항목 3", color: COLORS[2] },
  ])
  const [newItemText, setNewItemText] = useState("")
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const addItem = () => {
    if (newItemText.trim()) {
      const newItem: RouletteItem = {
        id: Date.now().toString(),
        text: newItemText.trim(),
        color: COLORS[items.length % COLORS.length]
      }
      setItems([...items, newItem])
      setNewItemText("")
    }
  }

  const removeItem = (id: string) => {
    if (items.length > 2) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  const spinRoulette = () => {
    if (isSpinning || items.length === 0) return

    setIsSpinning(true)
    setSelectedItem(null)

    // Random spins between 5 and 8 full rotations plus random angle
    const minSpins = 5
    const maxSpins = 8
    const spins = Math.floor(Math.random() * (maxSpins - minSpins + 1)) + minSpins
    const randomAngle = Math.random() * 360
    const totalRotation = rotation + (spins * 360) + randomAngle

    setRotation(totalRotation)

    // Calculate which item was selected
    setTimeout(() => {
      const normalizedRotation = totalRotation % 360
      const segmentAngle = 360 / items.length

      // Segments are drawn with index 0 starting at -90 degrees (top)
      // and continuing clockwise: index 0, 1, 2, 3...
      //
      // When we rotate the wheel clockwise by X degrees:
      // - A positive rotation moves segments clockwise
      // - The pointer stays at the top
      // - So if we rotate 30 degrees clockwise, the segment that was at 30 degrees is now at 0 (top)
      //
      // To find which segment is at the pointer (top = 0 degrees after rotation):
      // We need to find which segment was originally at position (-normalizedRotation) before rotation

      // Convert to the segment index
      // Since segments go clockwise starting from top, we reverse the rotation
      const angleFromTop = (360 - normalizedRotation) % 360
      const selectedIndex = Math.floor(angleFromTop / segmentAngle) % items.length

      setSelectedItem(items[selectedIndex].text)
      setIsSpinning(false)
    }, 4000) // Match the CSS transition duration
  }

  const drawRoulette = () => {
    const canvas = canvasRef.current
    if (!canvas || items.length === 0) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 10

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw segments
    const segmentAngle = (2 * Math.PI) / items.length

    items.forEach((item, index) => {
      const startAngle = index * segmentAngle - Math.PI / 2
      const endAngle = startAngle + segmentAngle

      // Draw segment
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = item.color
      ctx.fill()
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 3
      ctx.stroke()

      // Draw text
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(startAngle + segmentAngle / 2)
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 16px sans-serif"
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
      ctx.shadowBlur = 4
      ctx.fillText(item.text, radius * 0.65, 0)
      ctx.restore()
    })

    // Draw center circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI)
    ctx.fillStyle = "#ffffff"
    ctx.fill()
    ctx.strokeStyle = "#333"
    ctx.lineWidth = 3
    ctx.stroke()
  }

  useEffect(() => {
    drawRoulette()
  }, [items])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Roulette</h1>
        <p className="text-muted-foreground">
          항목을 추가하고 돌림판을 돌려보세요
        </p>
      </div>

      <Separator />

      <div className="max-w-4xl space-y-6">
        {/* Roulette Wheel */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Dices className="h-6 w-6" />
              돌림판
            </CardTitle>
            <CardDescription>
              {isSpinning ? "돌림판이 회전 중입니다..." : selectedItem ? `선택됨: ${selectedItem}` : "시작 버튼을 눌러 돌림판을 돌리세요"}
            </CardDescription>
          </CardHeader>
          <CardContent className="py-8">
            <div className="flex flex-col items-center gap-6">
              {/* Canvas Roulette with Fixed Pointer */}
              <div className="relative inline-block">
                {/* Fixed Pointer at Top - Centered */}
                <div
                  className="absolute left-1/2 z-10 pointer-events-none"
                  style={{
                    top: '5px',
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div style={{
                    width: 0,
                    height: 0,
                    borderLeft: '15px solid transparent',
                    borderRight: '15px solid transparent',
                    borderTop: '30px solid #FF6B6B',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }} />
                </div>

                {/* Rotating Canvas */}
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={400}
                  className="transition-transform duration-[4000ms] ease-out"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    filter: isSpinning ? 'blur(1px)' : 'none'
                  }}
                />
              </div>

              {/* Spin Button */}
              <Button
                onClick={spinRoulette}
                disabled={isSpinning || items.length === 0}
                size="lg"
                className="px-8 py-3 text-lg"
              >
                <Play className="h-5 w-5 mr-2" />
                {isSpinning ? "회전 중..." : "돌리기"}
              </Button>

              {/* Result Display */}
              {selectedItem && !isSpinning && (
                <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-2xl font-bold text-primary">
                    🎉 {selectedItem}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Item Management */}
        <Card>
          <CardHeader>
            <CardTitle>항목 관리</CardTitle>
            <CardDescription>
              돌림판에 표시될 항목을 추가하거나 삭제하세요 (최소 2개)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Item */}
            <div className="flex gap-2">
              <Input
                placeholder="새 항목 입력..."
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addItem()
                  }
                }}
                className="flex-1"
              />
              <Button onClick={addItem} disabled={!newItemText.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                추가
              </Button>
            </div>

            {/* Item List */}
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                >
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="flex-1 font-medium">{item.text}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length <= 2}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            {items.length < 2 && (
              <p className="text-sm text-destructive">
                최소 2개의 항목이 필요합니다
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
