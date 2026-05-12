'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const MODE_COLORS: Record<string, string> = {
  flight: '#0ea5e9',
  driving: '#2563eb',
  walking: '#f59e0b',
  cycling: '#10b981',
  transit: '#8b5cf6',
}

function divIcon(color: string, label: string) {
  return L.divIcon({
    className: '',
    html: `<div style="background:${color};color:white;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)">${label}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

interface Props {
  polyline: [number, number][]
  mode?: string
  className?: string
}

export default function RouteMap({ polyline, mode = 'driving', className = '' }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || instanceRef.current) return

    const map = L.map(mapRef.current, { zoomControl: false }).setView([0, 0], 2)
    instanceRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://openstreetmap.org">OSM</a>',
    }).addTo(map)

    return () => {
      map.remove()
      instanceRef.current = null
    }
  }, [])

  const overlayRef = useRef<L.FeatureGroup | null>(null)

  useEffect(() => {
    const map = instanceRef.current
    if (!map || polyline.length < 2) return

    if (overlayRef.current) {
      overlayRef.current.clearLayers()
    } else {
      overlayRef.current = L.featureGroup().addTo(map)
    }

    const { current: overlay } = overlayRef

    const color = MODE_COLORS[mode] || '#2563eb'

    L.polyline(polyline as [number, number][], { color, weight: 4, opacity: 0.8 }).addTo(overlay)

    const origin = polyline[0]
    const dest = polyline[polyline.length - 1]
    L.marker(origin, { icon: divIcon('#22c55e', 'O') }).addTo(overlay)
    L.marker(dest, { icon: divIcon('#ef4444', 'D') }).addTo(overlay)

    map.fitBounds(overlay.getBounds().pad(0.1), { padding: [30, 30] })

    return () => {
      overlay.clearLayers()
    }
  }, [polyline, mode])

  return (
    <div
      ref={mapRef}
      className={`rounded-lg overflow-hidden border border-slate-700 ${className}`}
      style={{ height: 200 }}
    />
  )
}
