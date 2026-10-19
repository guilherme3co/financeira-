#!/usr/bin/env python3
"""Monta o index.html a partir de src/ (o app continua sendo 1 arquivo só no site).

Uso:
  python3 build.py           -> gera index.html a partir de src/
  python3 build.py --check   -> só confere se index.html está igual ao que src/ gera (usado no teste diário)
  python3 build.py --split   -> (uma vez) divide o index.html atual em src/

Depois de mudar qualquer arquivo em src/, rode `python3 build.py` e envie src/ e index.html juntos.
O build também recalcula a "impressão digital" (hash) dos scripts na política de segurança (CSP).
"""
import base64, hashlib, os, re, sys

RAIZ = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(RAIZ, 'src')
SAIDA = os.path.join(RAIZ, 'index.html')
MOLDE = os.path.join(SRC, 'index.html')
CSS = os.path.join(SRC, 'css', 'app.css')
JSDIR = os.path.join(SRC, 'js')
M_CSS, M_JS = '/*@@CSS@@*/', '//@@JS@@'


def ler(p):
    with open(p, encoding='utf-8', newline='') as f:
        return f.read()


def gravar(p, s):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8', newline='') as f:
        f.write(s)


def csp(s):
    hs = []
    for m in re.finditer(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>', s, re.S):
        hs.append("'sha256-%s'" % base64.b64encode(hashlib.sha256(m.group(1).encode('utf-8')).digest()).decode())
    s2, n = re.subn(r"script-src 'self'[^;]*", "script-src 'self' " + ' '.join(hs), s, count=1)
    if n != 1:
        sys.exit('CSP não encontrada no molde')
    return s2


def montar():
    molde = ler(MOLDE)
    js = ''.join(ler(os.path.join(JSDIR, f)) for f in sorted(os.listdir(JSDIR)) if f.endswith('.js'))
    if molde.count(M_CSS) != 1 or molde.count(M_JS) != 1:
        sys.exit('Marcadores faltando em src/index.html')
    return csp(molde.replace(M_CSS, ler(CSS)).replace(M_JS, js))


def slug(t):
    t = t.lower()
    for a, b in (('áàâã', 'a'), ('éê', 'e'), ('í', 'i'), ('óôõ', 'o'), ('ú', 'u'), ('ç', 'c')):
        for c in a:
            t = t.replace(c, b)
    return re.sub(r'[^a-z0-9]+', '-', t).strip('-')[:40] or 'parte'


def dividir():
    s = ler(SAIDA)
    a = s.index('<style>') + len('<style>'); b = s.index('</style>', a)
    i = s.rindex('<script>') + len('<script>'); j = s.index('</script>', i)
    css, js = s[a:b], s[i:j]
    molde = s[:a] + M_CSS + s[b:i] + M_JS + s[j:]
    partes, ini, titulo = [], 0, 'inicio'
    for m in re.finditer(r'^/\* ---------- (.+?) ---------- \*/', js, re.M):
        if m.start() > ini:
            partes.append((titulo, js[ini:m.start()]))
        ini, titulo = m.start(), m.group(1)
    partes.append((titulo, js[ini:]))
    if os.path.isdir(JSDIR):
        for f in os.listdir(JSDIR):
            os.remove(os.path.join(JSDIR, f))
    for n, (t, c) in enumerate(partes):
        gravar(os.path.join(JSDIR, '%02d-%s.js' % (n, slug(t))), c)
    gravar(CSS, css)
    gravar(MOLDE, molde)
    print('src/ criado: %d partes de JS' % len(partes))


if __name__ == '__main__':
    if '--split' in sys.argv:
        dividir()
    elif '--check' in sys.argv:
        if montar() != ler(SAIDA):
            sys.exit('index.html está diferente do que src/ gera. Rode: python3 build.py')
        print('index.html confere com src/ ✅')
    else:
        gravar(SAIDA, montar())
        print('index.html gerado ✅')
