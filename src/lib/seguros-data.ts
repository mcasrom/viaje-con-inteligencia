import segurosJson from '@/data/seguros.json';

export interface SeguroProducto {
  id: string;
  nombre: string;
  aseguradora: string;
  web: string;
  precio_min: number;
  precio_max: number;
  moneda: string;
  coberturas: Record<string, any>;
  exclusiones: string[];
  recomendado_para: string[];
  afiliado: string;
}

export interface SeguroPerfil {
  id: string;
  label: string;
  descripcion: string;
  cobertura_minima: Record<string, number>;
}

export const catalog: SeguroProducto[] = (segurosJson as any).productos || [];
export const perfiles: SeguroPerfil[] = [];
