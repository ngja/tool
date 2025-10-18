"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Network, Copy, Check, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

type CIDRInfo = {
  cidr: string
  ipAddress: string
  subnetMask: string
  wildcardMask: string
  networkAddress: string
  broadcastAddress: string
  firstHost: string
  lastHost: string
  totalHosts: number
  usableHosts: number
  ipClass: string
  isPrivate: boolean
  binarySubnet: string
}

export default function CIDRPage() {
  const [input, setInput] = useState("192.168.1.0/24")
  const [cidrInfo, setCidrInfo] = useState<CIDRInfo | null>(null)
  const [error, setError] = useState<string>("")
  const [copied, setCopied] = useState<string>("")

  // Parse CIDR notation
  useEffect(() => {
    try {
      const trimmed = input.trim()
      if (!trimmed) {
        setCidrInfo(null)
        setError("")
        return
      }

      // Parse CIDR (IP/prefix or IP with subnet mask)
      let ipPart: string
      let prefix: number

      if (trimmed.includes('/')) {
        const parts = trimmed.split('/')
        ipPart = parts[0]
        prefix = parseInt(parts[1])

        if (isNaN(prefix) || prefix < 0 || prefix > 32) {
          setError("프리픽스는 0-32 사이여야 합니다")
          setCidrInfo(null)
          return
        }
      } else {
        // IP only, assume /32
        ipPart = trimmed
        prefix = 32
      }

      // Validate IP address
      const ipRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
      const match = ipPart.match(ipRegex)

      if (!match) {
        setError("올바른 IP 주소 형식이 아닙니다")
        setCidrInfo(null)
        return
      }

      const octets = [
        parseInt(match[1]),
        parseInt(match[2]),
        parseInt(match[3]),
        parseInt(match[4])
      ]

      // Validate octets
      if (octets.some(octet => octet < 0 || octet > 255)) {
        setError("IP 주소의 각 옥텟은 0-255 사이여야 합니다")
        setCidrInfo(null)
        return
      }

      // Calculate subnet mask
      const subnetMask = prefixToSubnetMask(prefix)
      const wildcardMask = subnetMaskToWildcard(subnetMask)

      // Calculate network address
      const networkAddress = calculateNetworkAddress(octets, subnetMask)

      // Calculate broadcast address
      const broadcastAddress = calculateBroadcastAddress(networkAddress, wildcardMask)

      // Calculate first and last host
      const firstHost = incrementIP(networkAddress)
      const lastHost = decrementIP(broadcastAddress)

      // Calculate total and usable hosts
      const totalHosts = Math.pow(2, 32 - prefix)
      const usableHosts = prefix === 32 ? 1 : (prefix === 31 ? 2 : totalHosts - 2)

      // Determine IP class
      const ipClass = getIPClass(octets[0])

      // Check if private IP
      const isPrivate = isPrivateIP(octets)

      // Binary subnet mask
      const binarySubnet = subnetMask.map(octet =>
        octet.toString(2).padStart(8, '0')
      ).join('.')

      setCidrInfo({
        cidr: `${networkAddress.join('.')}/${prefix}`,
        ipAddress: ipPart,
        subnetMask: subnetMask.join('.'),
        wildcardMask: wildcardMask.join('.'),
        networkAddress: networkAddress.join('.'),
        broadcastAddress: broadcastAddress.join('.'),
        firstHost: firstHost.join('.'),
        lastHost: lastHost.join('.'),
        totalHosts,
        usableHosts,
        ipClass,
        isPrivate,
        binarySubnet
      })
      setError("")
    } catch (err) {
      setError("CIDR 계산 중 오류가 발생했습니다")
      setCidrInfo(null)
    }
  }, [input])

  // Convert prefix length to subnet mask
  const prefixToSubnetMask = (prefix: number): number[] => {
    const mask = []
    for (let i = 0; i < 4; i++) {
      const n = Math.min(prefix, 8)
      mask.push((256 - Math.pow(2, 8 - n)) & 255)
      prefix -= n
    }
    return mask
  }

  // Convert subnet mask to wildcard mask
  const subnetMaskToWildcard = (mask: number[]): number[] => {
    return mask.map(octet => 255 - octet)
  }

  // Calculate network address
  const calculateNetworkAddress = (ip: number[], mask: number[]): number[] => {
    return ip.map((octet, i) => octet & mask[i])
  }

  // Calculate broadcast address
  const calculateBroadcastAddress = (network: number[], wildcard: number[]): number[] => {
    return network.map((octet, i) => octet | wildcard[i])
  }

  // Increment IP address
  const incrementIP = (ip: number[]): number[] => {
    const result = [...ip]
    for (let i = 3; i >= 0; i--) {
      if (result[i] < 255) {
        result[i]++
        break
      } else {
        result[i] = 0
      }
    }
    return result
  }

  // Decrement IP address
  const decrementIP = (ip: number[]): number[] => {
    const result = [...ip]
    for (let i = 3; i >= 0; i--) {
      if (result[i] > 0) {
        result[i]--
        break
      } else {
        result[i] = 255
      }
    }
    return result
  }

  // Get IP class
  const getIPClass = (firstOctet: number): string => {
    if (firstOctet >= 1 && firstOctet <= 126) return 'A'
    if (firstOctet >= 128 && firstOctet <= 191) return 'B'
    if (firstOctet >= 192 && firstOctet <= 223) return 'C'
    if (firstOctet >= 224 && firstOctet <= 239) return 'D (Multicast)'
    if (firstOctet >= 240 && firstOctet <= 255) return 'E (Reserved)'
    return 'Unknown'
  }

  // Check if private IP
  const isPrivateIP = (octets: number[]): boolean => {
    // 10.0.0.0/8
    if (octets[0] === 10) return true
    // 172.16.0.0/12
    if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return true
    // 192.168.0.0/16
    if (octets[0] === 192 && octets[1] === 168) return true
    // 127.0.0.0/8 (loopback)
    if (octets[0] === 127) return true
    return false
  }

  // Copy to clipboard
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(field)
      setTimeout(() => setCopied(""), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  // Common CIDR presets
  const presets = [
    { label: "/8 (Class A)", value: "10.0.0.0/8" },
    { label: "/16 (Class B)", value: "172.16.0.0/16" },
    { label: "/24 (Class C)", value: "192.168.1.0/24" },
    { label: "/32 (Single Host)", value: "192.168.1.1/32" },
    { label: "/28 (16 IPs)", value: "192.168.1.0/28" },
    { label: "/29 (8 IPs)", value: "192.168.1.0/29" },
    { label: "/30 (4 IPs)", value: "192.168.1.0/30" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CIDR</h1>
        <p className="text-muted-foreground">
          CIDR 표기법을 분석하고 네트워크 정보를 확인하세요
        </p>
      </div>

      <Separator />

      <div className="max-w-5xl space-y-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-6 w-6" />
              CIDR 입력
            </CardTitle>
            <CardDescription>
              IP 주소와 프리픽스 길이를 입력하세요 (예: 192.168.1.0/24)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cidr-input">CIDR 표기법</Label>
              <Input
                id="cidr-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="예: 192.168.1.0/24"
                className="font-mono text-lg"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <Info className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Presets */}
            <div className="space-y-2">
              <Label>빠른 선택</Label>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <Button
                    key={preset.value}
                    variant="outline"
                    size="sm"
                    onClick={() => setInput(preset.value)}
                    className="text-xs"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {cidrInfo && !error && (
          <>
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
                <CardDescription>네트워크 기본 정보</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">입력된 IP 주소</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(cidrInfo.ipAddress, 'ip')}
                        className="h-6 w-6 p-0"
                      >
                        {copied === 'ip' ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <div className="font-mono text-lg">{cidrInfo.ipAddress}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">CIDR 표기법</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(cidrInfo.cidr, 'cidr')}
                        className="h-6 w-6 p-0"
                      >
                        {copied === 'cidr' ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <div className="font-mono text-lg">{cidrInfo.cidr}</div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">IP 클래스</Label>
                    <div className="text-lg">
                      <Badge variant="secondary">{cidrInfo.ipClass}</Badge>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">네트워크 유형</Label>
                    <div className="text-lg">
                      <Badge variant={cidrInfo.isPrivate ? "default" : "outline"}>
                        {cidrInfo.isPrivate ? "Private" : "Public"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subnet Masks */}
            <Card>
              <CardHeader>
                <CardTitle>서브넷 마스크</CardTitle>
                <CardDescription>서브넷 및 와일드카드 마스크 정보</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">서브넷 마스크</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(cidrInfo.subnetMask, 'subnet')}
                        className="h-6 w-6 p-0"
                      >
                        {copied === 'subnet' ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <div className="font-mono text-lg">{cidrInfo.subnetMask}</div>
                    <div className="font-mono text-xs text-muted-foreground mt-1">
                      {cidrInfo.binarySubnet}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">와일드카드 마스크</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(cidrInfo.wildcardMask, 'wildcard')}
                        className="h-6 w-6 p-0"
                      >
                        {copied === 'wildcard' ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <div className="font-mono text-lg">{cidrInfo.wildcardMask}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Network Addresses */}
            <Card>
              <CardHeader>
                <CardTitle>네트워크 주소</CardTitle>
                <CardDescription>네트워크 및 호스트 주소 범위</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">네트워크 주소</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(cidrInfo.networkAddress, 'network')}
                        className="h-6 w-6 p-0"
                      >
                        {copied === 'network' ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <div className="font-mono text-lg">{cidrInfo.networkAddress}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">브로드캐스트 주소</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(cidrInfo.broadcastAddress, 'broadcast')}
                        className="h-6 w-6 p-0"
                      >
                        {copied === 'broadcast' ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <div className="font-mono text-lg">{cidrInfo.broadcastAddress}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">첫 번째 호스트</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(cidrInfo.firstHost, 'first')}
                        className="h-6 w-6 p-0"
                      >
                        {copied === 'first' ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <div className="font-mono text-lg">{cidrInfo.firstHost}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">마지막 호스트</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(cidrInfo.lastHost, 'last')}
                        className="h-6 w-6 p-0"
                      >
                        {copied === 'last' ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <div className="font-mono text-lg">{cidrInfo.lastHost}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Host Counts */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle>호스트 정보</CardTitle>
                <CardDescription>사용 가능한 IP 주소 개수</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="text-center p-6 bg-background rounded-lg border">
                    <div className="text-sm text-muted-foreground mb-2">전체 IP 개수</div>
                    <div className="text-3xl font-bold font-mono">
                      {cidrInfo.totalHosts.toLocaleString()}
                    </div>
                  </div>

                  <div className="text-center p-6 bg-background rounded-lg border">
                    <div className="text-sm text-muted-foreground mb-2">사용 가능한 호스트</div>
                    <div className="text-3xl font-bold font-mono text-primary">
                      {cidrInfo.usableHosts.toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reference */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="text-sm space-y-2">
                  <p className="font-medium">💡 참고 사항</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>네트워크 주소는 해당 서브넷의 첫 번째 주소입니다</li>
                    <li>브로드캐스트 주소는 해당 서브넷의 마지막 주소입니다</li>
                    <li>사용 가능한 호스트는 네트워크 주소와 브로드캐스트 주소를 제외한 개수입니다</li>
                    <li>/31 서브넷은 Point-to-Point 링크에서 사용되며 2개의 사용 가능한 주소를 가집니다</li>
                    <li>/32 서브넷은 단일 호스트를 나타냅니다</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
