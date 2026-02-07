-- Enable pgvector extension (run this in Neon console first if not done)
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to Producto table (768 dimensions for Gemini text-embedding-004)
ALTER TABLE "Producto" ADD COLUMN IF NOT EXISTS "embedding" vector(768);

-- Create an index for faster similarity search
CREATE INDEX IF NOT EXISTS "Producto_embedding_idx" ON "Producto"
USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100);

-- Function to search products by similarity
CREATE OR REPLACE FUNCTION search_products_by_embedding(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id text,
  nombre text,
  referencia text,
  serie text,
  descripcion text,
  formato text,
  precio_m2 float,
  stock_m2 float,
  imagen text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.nombre,
    p.referencia,
    p.serie,
    p.descripcion,
    p.formato,
    p.precio_m2,
    p.stock_m2,
    p.imagen,
    1 - (p.embedding <=> query_embedding) as similarity
  FROM "Producto" p
  WHERE p.embedding IS NOT NULL
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
