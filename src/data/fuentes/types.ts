import type { NivelRiesgo } from "../paises";

export type FuenteId = "maec" | "us-state-dept" | "uk-fcdo" | "canada" | "australia";

export interface AdvisoryFuente {
  id: FuenteId;
  nombre: string;
  siglas: string;
  pais: string;
  bandera: string;
  nivelRiesgo: NivelRiesgo | null;
  nivelOriginal: string;
  url: string;
  resumen: string | null;
  actualizado: string | null;
}
