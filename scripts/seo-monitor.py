#!/usr/bin/env python3
import urllib.request
import json
import re
from datetime import datetime

RESEND_API_KEY = "re_dMrA9tEz_EtRw4XGV3Lz1ahvKvckkj7xp"
EMAIL_FROM = "notificaciones@viajeinteligencia.com"
EMAIL_TO = "gestion@viajeinteligencia.com"

URLS = [
    ("blog?page=2", "https://www.viajeinteligencia.com/blog?page=2", "canonical", "/blog"),
    ("rutas?route=murcia", "https://www.viajeinteligencia.com/rutas?route=murcia", "canonical", "/rutas"),
    ("coste/seguros?destino=ES", "https://www.viajeinteligencia.com/coste/seguros?destino=ES", "canonical", "/coste/seguros"),
    ("viajes/clima/br", "https://www.viajeinteligencia.com/viajes/clima/br", "canonical", "/viajes/clima"),
    ("premium?redirect=/clustering", "https://www.viajeinteligencia.com/premium?redirect=/clustering", "canonical", "/premium"),
    ("en/blog", "https://www.viajeinteligencia.com/en/blog", "noindex", None),
    ("dashboard", "https://www.viajeinteligencia.com/dashboard", "noindex", None),
    ("pais/rw", "https://www.viajeinteligencia.com/pais/rw", "canonical", "/pais/rw"),
    ("seguridad", "https://www.viajeinteligencia.com/seguridad", "canonical", "/seguridad"),
]

def fetch(url):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "seo-monitor/1.0"})
        with urllib.request.urlopen(req, timeout=10) as r:
            return r.read().decode("utf-8", errors="ignore")
    except Exception as e:
        return f"ERROR:{e}"

def check_url(name, url, check_type, expected):
    html = fetch(url)
    if html.startswith("ERROR:"):
        return f"❌ {name} — {html}"
    if check_type == "noindex":
        if "noindex" in html:
            return None
        return f"❌ {name} — falta noindex"
    if check_type == "canonical":
        m = re.search(r'canonical" href="([^"]+)"', html)
        if not m:
            return f"❌ {name} — sin canonical"
        if expected not in m.group(1):
            return f"❌ {name} — canonical incorrecto: {m.group(1)}"
        return None

def send_email(errors):
    body = f"SEO Monitor — {datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n" + "\n".join(errors)
    data = json.dumps({
        "from": EMAIL_FROM,
        "to": [EMAIL_TO],
        "subject": f"⚠️ SEO Monitor: {len(errors)} errores detectados",
        "text": body
    }).encode()
    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=data,
        headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"}
    )
    urllib.request.urlopen(req, timeout=10)

errors = [r for name, url, ct, exp in URLS if (r := check_url(name, url, ct, exp))]
if errors:
    print(f"ALERTAS: {len(errors)}")
    for e in errors:
        print(e)
    send_email(errors)
    print("Email enviado")
else:
    print(f"OK — {datetime.now().strftime('%Y-%m-%d %H:%M')} — todas las URLs correctas")
