#!/usr/bin/env python3
"""
Elimina caracteres cirílicos, chinos y árabes incrustados en posts MD.
Mantiene: español, emojis, €, £, º, °, ¿, ¡, y puntuación estándar.
"""
import os
import re

POSTS_DIR = os.path.expanduser("~/viaje-con-inteligencia/content/posts")
BACKUP_DIR = os.path.expanduser("~/viaje-con-inteligencia/content/posts_backup")

# Rangos de caracteres a eliminar
PATRON_ELIMINAR = re.compile(
    r'['
    r'\u0400-\u04FF'  # Cirílico
    r'\u4E00-\u9FFF'  # Chino CJK
    r'\u3400-\u4DBF'  # CJK extensión A
    r'\u0600-\u06FF'  # Árabe
    r'\u0750-\u077F'  # Árabe suplementario
    r'\uFB50-\uFDFF'  # Árabe presentación A
    r'\uFE70-\uFEFF'  # Árabe presentación B
    r'\u3040-\u309F'  # Hiragana
    r'\u30A0-\u30FF'  # Katakana
    r'\uAC00-\uD7AF'  # Coreano
    r']+'
)

def limpiar_archivo(ruta):
    with open(ruta, 'r', encoding='utf-8') as f:
        contenido = f.read()
    
    # Encontrar todos los caracteres problemáticos antes de limpiar
    encontrados = set(PATRON_ELIMINAR.findall(contenido))
    
    if not encontrados:
        return False, 0
    
    # Limpiar — reemplazar por espacio para no unir palabras
    limpio = PATRON_ELIMINAR.sub(' ', contenido)
    # Limpiar espacios múltiples resultantes
    limpio = re.sub(r' {2,}', ' ', limpio)
    limpio = re.sub(r' ([.,;:!?])', r'\1', limpio)
    
    with open(ruta, 'w', encoding='utf-8') as f:
        f.write(limpio)
    
    return True, len(encontrados)

def main():
    # Crear backup
    os.makedirs(BACKUP_DIR, exist_ok=True)
    
    posts = sorted([f for f in os.listdir(POSTS_DIR) if f.endswith('.md')])
    print(f"📄 Procesando {len(posts)} posts...\n")
    
    modificados = 0
    for post in posts:
        ruta = os.path.join(POSTS_DIR, post)
        # Backup
        backup = os.path.join(BACKUP_DIR, post)
        with open(ruta, 'r', encoding='utf-8') as f:
            with open(backup, 'w', encoding='utf-8') as b:
                b.write(f.read())
        
        modificado, n = limpiar_archivo(ruta)
        if modificado:
            print(f"  ✅ {post} — {n} fragmentos eliminados")
            modificados += 1
        else:
            print(f"  ⬜ {post} — limpio")
    
    print(f"\n📊 {modificados}/{len(posts)} posts modificados")
    print(f"💾 Backup en: {BACKUP_DIR}")

if __name__ == '__main__':
    main()
