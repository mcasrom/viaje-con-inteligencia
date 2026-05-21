'use client';

import { useEffect, useState } from 'react';
import { NivelRiesgo } from '@/data/paises';

interface BoostedCountry {
  boostedLevel: NivelRiesgo;
  incidentType: string;
  severity: string;
}

const BOOST_MAP: Record<string, NivelRiesgo> = {
  conflict: 'alto',
  terrorism: 'alto',
  security_threat: 'medio',
  protest: 'medio',
  health_outbreak: 'alto',
};

// Severity threshold: only incidents at 'high' or 'critical' trigger boost
const MIN_BOOST_SEVERITY = 'high';

// Minimum boosting incidents for same country to apply boost
const BOOST_THRESHOLD = 2;

const SEVERITY_ORDER = ['low', 'medium', 'high', 'critical'];

function maxLevel(a: NivelRiesgo, b: NivelRiesgo): NivelRiesgo {
  const order: NivelRiesgo[] = ['sin-riesgo', 'bajo', 'medio', 'alto', 'muy-alto'];
  return order.indexOf(a) >= order.indexOf(b) ? a : b;
}

function meetsSeverityThreshold(s: string): boolean {
  return SEVERITY_ORDER.indexOf(s) >= SEVERITY_ORDER.indexOf(MIN_BOOST_SEVERITY);
}

export function useIncidentBoost(): Record<string, BoostedCountry> {
  const [boostMap, setBoostMap] = useState<Record<string, BoostedCountry>>({});

  useEffect(() => {
    let cancelled = false;
    fetch('/api/incidents?limit=200')
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        const incidents = data.incidents || [];

        // Count boosting-type incidents per country (only high/critical severity)
        const counts: Record<string, number> = {};
        const boosts: Record<string, BoostedCountry> = {};

        for (const inc of incidents) {
          const code: string = (inc.country_code || '').toUpperCase();
          if (!code || code.length !== 2) continue;
          const type: string = inc.type || '';
          const boost = BOOST_MAP[type];
          if (!boost) continue;
          if (!meetsSeverityThreshold(inc.severity || 'low')) continue;

          counts[code] = (counts[code] || 0) + 1;
          const existing = boosts[code];
          boosts[code] = {
            boostedLevel: existing ? maxLevel(existing.boostedLevel, boost) : boost,
            incidentType: existing ? existing.incidentType : type,
            severity: existing ? maxLevelBySeverity(existing.severity, inc.severity || 'low') : (inc.severity || 'low'),
          };
        }

        // Final map: only include countries meeting the incident count threshold
        const map: Record<string, BoostedCountry> = {};
        for (const [code, b] of Object.entries(boosts)) {
          if (counts[code] >= BOOST_THRESHOLD) {
            map[code] = b;
          }
        }
        setBoostMap(map);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return boostMap;
}

function maxLevelBySeverity(a: string, b: string): string {
  const order = ['low', 'medium', 'high', 'critical'];
  return order.indexOf(a) >= order.indexOf(b) ? a : b;
}

export function applyBoost(
  baseLevel: NivelRiesgo,
  boost: BoostedCountry | undefined,
): NivelRiesgo {
  if (!boost) return baseLevel;
  return maxLevel(baseLevel, boost.boostedLevel);
}
