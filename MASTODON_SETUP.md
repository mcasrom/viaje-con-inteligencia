# Mastodon Integration - Viaje con Inteligencia

## Configuración

### Variables de Entorno (Vercel)

Añadir en Vercel Project Settings → Environment Variables:

| Variable | Valor |
|----------|-------|
| `MASTODON_ACCESS_TOKEN` | `9Xu-6neeKdlzGHT8s38M3KRw6xKMi7jW-Ty8ejtmiGg` |

### Permisos OAuth necesarios
- `write:statuses` - Publicar mensajes

## APIs

### Publicar post
```bash
curl -X POST https://viaje-con-inteligencia.vercel.app/api/mastodon/publish \
  -H "Content-Type: application/json" \
  -d '{"text": "Hola desde ViajeInteligencia! 🌍"}'
```

### Respuesta
```json
{
  "success": true,
  "id": "123456789",
  "url": "https://mastodon.social/@viajeinteligencia/123456789"
}
```

## Uso programático

```typescript
import { publishToMastodon } from '@/lib/mastodon';

await publishToMastodon(
  'Título del post',
  'Excerpt del contenido...',
  'slug-del-post',
  ['tag1', 'tag2']
);
```