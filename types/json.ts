/** Valeur JSON, telle que stockée dans les colonnes `jsonb`. */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
