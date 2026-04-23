#!/usr/bin/env python3
"""
Revisión ortográfica y gramatical de posts MD usando LanguageTool API gratuita.
"""
import os
import re
import json
import time
import urllib.request
import urllib.parse

POSTS_DIR = os.path.expanduser("~/viaje-con-inteligencia/content/posts")
INFORME = os.path.expanduser("~/viaje-con-inteligencia/revision_posts.md")
API_URL = "https://api.languagetool.org/v2/check"

def extraer_texto(contenido):
    """Elimina frontmatter YAML y extrae texto plano."""
    # Eliminar frontmatter
    contenido = re.sub(r'^---.*?---\s*', '', contenido, flags=re.DOTALL)
    # Eliminar markdown: headers, bold, italic, links, imágenes, tablas
    contenido = re.sub(r'!\[.*?\]\(.*?\)', '', contenido)
    contenido = re.sub(r'\[([^\]]+)\]\(.*?\)', r'\1', contenido)
    contenido = re.sub(r'#{1,6}\s+', '', contenido)
    contenido = re.sub(r'\*{1,2}([^*]+)\*{1,2}', r'\1', contenido)
    contenido = re.sub(r'`[^`]+`', '', contenido)
    contenido = re.sub(r'^\|.*\|$', '', contenido, flags=re.MULTILINE)
    contenido = re.sub(r'^[-*]\s+', '', contenido, flags=re.MULTILINE)
    # Eliminar caracteres no latinos sospechosos (excepto español)
    chars_raros = re.findall(r'[^\x00-\x7F\u00C0-\u024F\u2019\u201C\u201D\u2013\u2014\s]', contenido)
    return contenido.strip(), list(set(chars_raros))

def revisar_languagetool(texto):
    """Envía texto a LanguageTool API y devuelve errores."""
    # Limitar a 20000 chars por límite gratuito
    texto = texto[:20000]
    datos = urllib.parse.urlencode({
        'text': texto,
        'language': 'es',
        'enabledOnly': 'false',
    }).encode('utf-8')
    req = urllib.request.Request(API_URL, data=datos, method='POST')
    req.add_header('Content-Type', 'application/x-www-form-urlencoded')
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        return {'error': str(e), 'matches': []}

def main():
    posts = sorted([f for f in os.listdir(POSTS_DIR) if f.endswith('.md')])
    print(f"📄 {len(posts)} posts encontrados\n")
    
    informe = ["# Revisión ortográfica y gramatical de posts\n"]
    informe.append(f"**Total posts:** {len(posts)}\n")
    informe.append("---\n")
    
    total_errores = 0
    
    for i, post in enumerate(posts, 1):
        ruta = os.path.join(POSTS_DIR, post)
        with open(ruta, 'r', encoding='utf-8') as f:
            contenido = f.read()
        
        texto, chars_raros = extraer_texto(contenido)
        print(f"[{i}/{len(posts)}] Revisando {post}...")
        
        resultado = revisar_languagetool(texto)
        errores = resultado.get('matches', [])
        total_errores += len(errores)
        
        informe.append(f"\n## {post}")
        
        if chars_raros:
            informe.append(f"\n⚠️ **Caracteres no latinos detectados:** `{'`, `'.join(chars_raros)}`\n")
        
        if not errores:
            informe.append("✅ Sin errores detectados\n")
        else:
            informe.append(f"❌ **{len(errores)} errores encontrados:**\n")
            for e in errores:
                contexto = e.get('context', {})
                texto_ctx = contexto.get('text', '')
                offset = contexto.get('offset', 0)
                longitud = contexto.get('length', 0)
                fragmento = texto_ctx[max(0,offset-20):offset+longitud+20]
                sugerencias = [s['value'] for s in e.get('replacements', [])[:3]]
                mensaje = e.get('message', '')
                informe.append(f"- **Error:** {mensaje}")
                informe.append(f"  - Contexto: `...{fragmento}...`")
                if sugerencias:
                    informe.append(f"  - Sugerencias: {', '.join(sugerencias)}")
                informe.append("")
        
        informe.append("---")
        # Pausa para no saturar la API gratuita
        time.sleep(2)
    
    informe.append(f"\n## Resumen\n**Total errores encontrados:** {total_errores}")
    
    with open(INFORME, 'w', encoding='utf-8') as f:
        f.write('\n'.join(informe))
    
    print(f"\n✅ Informe generado: {INFORME}")
    print(f"📊 Total errores: {total_errores}")

if __name__ == '__main__':
    main()
