#!/usr/bin/env bash
# Confere se o site publicado está na mesma versão do repositório (espera até 10 minutos).
v=$(grep -o 'name="app-versao" content="[^"]*"' index.html | head -1)
for i in $(seq 1 20); do
  code=$(curl -sSL -o site.html -w '%{http_code}' -H 'Cache-Control: no-cache' "https://guilherme3co.github.io/financeiro/index.html?t=$(date +%s)" || echo erro)
  no_ar=$(grep -o 'name="app-versao" content="[^"]*"' site.html 2>/dev/null | head -1 || true)
  if [ "$no_ar" = "$v" ]; then echo "Site no ar: $v"; exit 0; fi
  if [ "$i" = "1" ] || [ "$i" = "20" ]; then echo "::warning::Tentativa $i: HTTP $code, no ar [$no_ar], esperado [$v]"; fi
  sleep 30
done
exit 1
