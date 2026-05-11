'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Props {
  polyline: [number, number][]
  className?: string
}

export default function RouteMap({ polyline, className = '' }: Props) {
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

  useEffect(() => {
    const map = instanceRef.current
    if (!map || polyline.length < 2) return

    const layer = L.polyline(polyline as [number, number][], {
      color: '#2563eb',
      weight: 4,
      opacity: 0.8,
    }).addTo(map)

    map.fitBounds(layer.getBounds(), { padding: [30, 30] })

    return () => {
      map.removeLayer(layer)
    }
  }, [polyline])

  return (
    <div
      ref={mapRef}
      className={`rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 ${className}`}
      style={{ height: 200 }}
    />
  )
}
