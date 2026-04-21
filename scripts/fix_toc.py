import re
import glob

posts = glob.glob('content/posts/es-seguro-viajar-*.md')

for post_file in posts:
    with open(post_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Eliminar la sección de índice con enlaces rotos
    # Buscar desde "## Índice" hasta el siguiente ## o ---
    content = re.sub(
        r'##\s*📊?\s*Índice del Artículo.*?(?=\n##|\n---\n#)',
        '',
        content,
        flags=re.DOTALL
    )
    
    # También eliminar índice simple
    content = re.sub(
        r'##\s*Índice.*?(?=\n##|\n---\n#)',
        '',
        content,
        flags=re.DOTALL
    )
    
    # Limpiar múltiples líneas en blanco
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    with open(post_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✓ Corregido TOC: {post_file.split('/')[-1]}")

print("\n✅ TOC eliminado")
