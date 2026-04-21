import os
import re
import glob

# Mapeo de países a imágenes Unsplash
IMAGES = {
    'alemania': 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800',
    'argentina': 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800',
    'australia': 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800',
    'austria': 'https://images.unsplash.com/photo-1516550893923-42d28e567357?w=800',
    'bali': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    'belgica': 'https://images.unsplash.com/photo-1542639176716-94c629c68368?w=800',
    'brasil': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800',
    'canada': 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800',
    'chile': 'https://images.unsplash.com/photo-1538166233946-2f90a4d6721c?w=800',
    'colombia': 'https://images.unsplash.com/photo-1583267318073-795748127e8b?w=800',
    'estados-unidos': 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800',
    'francia': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
    'grecia': 'https://images.unsplash.com/photo-1503152394-c571994fd383?w=800',
    'italia': 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e6b?w=800',
    'japon': 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800',
    'maldivas': 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',
    'mexico': 'https://images.unsplash.com/photo-1518105779142-d3f702918b1a?w=800',
    'paises-bajos': 'https://images.unsplash.com/photo-1512470876302-68702ea22608?w=800',
    'portugal': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',
    'republica-checa': 'https://images.unsplash.com/photo-1518659523042-18e2f0bed511?w=800',
    'sri-lanka': 'https://images.unsplash.com/photo-1591439652809-ea9c5322de93?w=800',
    'suiza': 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800',
    'tailandia': 'https://images.unsplash.com/photo-1528181304800-259ecc088f0a?w=800',
    'vietnam': 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
}

# Secciones problemáticas a eliminar
BAD_SECTIONS = [
    r'##\s*1\. Panorama general de seguridad.*?(?=\n##|\Z)',
    r'##\s*2\. Nivel de riesgo según el MAEC.*?(?=\n##|\Z)',
    r'##\s*3\. Zonas seguras y zonas a evitar.*?(?=\n##|\Z)',
    r'##\s*4\. Tipos de riesgos principales.*?(?=\n##|\Z)',
    r'##\s*5\. Seguridad por ciudades.*?(?=\n##|\Z)',
    r'##\s*6\. Transporte y movilidad.*?(?=\n##|\Z)',
    r'##\s*7\. Saneidad y emergencias.*?(?=\n##|\Z)',
    r'##\s*8\. Cultura local y etiqueta.*?(?=\n##|\Z)',
    r'##\s*9\. Cuándo viajar.*?(?=\n##|\Z)',
    r'##\s*10\. Conclusión.*?(?=\n##|\Z)',
]

posts = glob.glob('content/posts/es-seguro-viajar-*.md')

for post_file in posts:
    with open(post_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extraer slug del filename
    slug = post_file.split('/')[-1].replace('.md', '')
    pais = slug.replace('es-seguro-viajar-', '')
    
    # 1. Quitar [ANÁLISIS] del título y añadir como tag
    content = re.sub(r'title:\s*"\[ANÁLISIS\]\s*', 'title: "', content)
    if 'tags:' not in content:
        content = content.replace('excerpt:', 'tags: ["Análisis"]\nexcerpt:')
    
    # 2. Añadir imagen si no existe o es genérica
    if pais in IMAGES:
        # Buscar línea de image y reemplazar
        if re.search(r'^image:\s*https?://', content, re.MULTILINE):
            content = re.sub(r'^image:\s*.*?$', f'image: {IMAGES[pais]}', content, flags=re.MULTILINE)
        else:
            # Añadir después de readTime
            content = re.sub(r'(readTime:.*)', rf'\1\nimage: {IMAGES[pais]}', content)
    
    # 3. Eliminar secciones problemáticas (internal links rotos)
    for pattern in BAD_SECTIONS:
        content = re.sub(pattern, '', content)
    
    # Limpiar múltiples líneas en blanco
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    with open(post_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✓ Corregido: {pais}")

print("\n✅ Todas las correcciones aplicadas")
