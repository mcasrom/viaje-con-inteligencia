import type { FuenteId } from "./types";

export interface FuenteMeta {
  id: FuenteId;
  nombre: string;
  siglas: string;
  bandera: string;
  urlBase: string;
}

export const FUENTES_META: Record<FuenteId, FuenteMeta> = {
  "maec": {
    id: "maec",
    nombre: "Ministerio de Asuntos Exteriores (España)",
    siglas: "MAEC",
    bandera: "🇪🇸",
    urlBase: "https://www.exteriores.gob.es/es/recomendaciones-viaje/Paginas/",
  },
  "us-state-dept": {
    id: "us-state-dept",
    nombre: "U.S. Department of State",
    siglas: "US State Dept",
    bandera: "🇺🇸",
    urlBase: "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/",
  },
  "uk-fcdo": {
    id: "uk-fcdo",
    nombre: "Foreign, Commonwealth & Development Office",
    siglas: "UK FCDO",
    bandera: "🇬🇧",
    urlBase: "https://www.gov.uk/foreign-travel-advice/",
  },
  "canada": {
    id: "canada",
    nombre: "Government of Canada",
    siglas: "Canadá",
    bandera: "🇨🇦",
    urlBase: "https://travel.gc.ca/destinations/",
  },
  "australia": {
    id: "australia",
    nombre: "Australian Government - Smartraveller",
    siglas: "Australia",
    bandera: "🇦🇺",
    urlBase: "https://www.smartraveller.gov.au/destinations/",
  },
};
