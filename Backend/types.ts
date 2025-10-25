// Backend/types.ts
export interface Ingeniero {
  id: number;
  nombre: string;
  numero_colegiado: string;
  dpi: string;
  email: string;
  fecha_nacimiento: Date;
  departamento_id: number;
  municipio_id: number;
  especialidad?: string;
  rol: 'usuario' | 'admin';
  ha_votado: boolean;
  fecha_registro: Date;
}

export interface Campana {
  id: number;
  campana_id?: number;
  titulo: string;
  nombre: string;
  descripcion?: string;
  color: string;
  logo_url?: string;
  fecha_inicio?: Date;
  fecha_fin?: Date;
  votos_por_votante: number;
  estado: 'programada' | 'activa' | 'finalizada';
  fecha_creacion: Date;
  total_candidatos?: number;
  total_votos?: number;
  total_votantes?: number;
  estado_actual?: string;
}

export interface Candidato {
  id: number;
  nombre: string;
  numero_colegiado: string;
  cargo_id: number;
  cargo_nombre?: string;
  cargo_orden?: number;
  campaña_id: number;
  numero_orden: number;
  especialidad?: string;
  foto_url?: string;
  total_votos?: number;
}

export interface Voto {
  id: number;
  ingeniero_id: number;
  candidato_id: number;
  cargo_id: number;
  campaña_id: number;
  departamento_id: number;
  municipio_id: number;
  fecha_voto: Date;
}

export interface Cargo {
  id: number;
  nombre: string;
  descripcion?: string;
  orden: number;
}

export interface JWTPayload {
  id: number;
  numero_colegiado: string;
  nombre: string;
  email: string;
  rol: 'usuario' | 'admin';
}

export interface ResultadoCargo {
  cargo_id: number;
  cargo: string;
  cargo_orden: number;
  candidatos: {
    candidato_id: number;
    candidato: string;
    numero_colegiado: string;
    total_votos: number;
  }[];
}

export interface EstadisticasReporte {
  ingenieros: {
    total_ingenieros: number;
    ingenieros_votaron: number;
    ingenieros_pendientes: number;
  };
  votos: {
    total_votos: number;
  };
  campanas: {
    total_campanas: number;
    campanas_activas: number;
  };
}