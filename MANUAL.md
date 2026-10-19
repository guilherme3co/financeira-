# Manual do Minhas Finanças (v1.3)

App de controle de gastos que funciona no navegador do celular.
Endereço: **https://guilherme3co.github.io/financeiro**

## 1. Instalar no celular
- **Android (Chrome):** abra o endereço → menu ⋮ → **Instalar app**.
- **iPhone (Safari):** abra o endereço → **Compartilhar** → **Adicionar à Tela de Início**.
  (No iPhone, os avisos só funcionam com o app instalado assim.)

## 2. Uso do dia a dia
- Toque no **+** para ver as opções: **Lançar, Investir, Casal, Inteligência, Mentor e Histórico**.
- **Lançar:** fale, digite, tire foto ou mande o PDF do comprovante.
  Ex.: “gastei 12,50 no pix na padaria”. Com valor e pagamento, salva sozinho.
- Lugar já conhecido entra sozinho com a mesma categoria (aparece **Desfazer** e **Editar**).
- Compra parcelada: “tênis 300 em 3x no crédito”. A 1ª parcela conta no mês seguinte.
- O mês fecha sozinho no dia 1 e vai para o **Histórico**.

## 3. Configurações (⚙)
| Bloco | Para que serve |
|---|---|
| 💰 Meu dinheiro | Saldo, limite, contas, parcelas e CDI |
| ✍️ Lançamentos | Microfone, comprovante, memória e categorias |
| 🔒 Segurança e backup | **Checkup de segurança**, digital e backup na nuvem |
| 🔔 Avisos | Contas a vencer, mesmo com o app fechado |
| 👫 Casal | Ligar com o celular do par pelo QR Code |
| 🛡️ Administrador | Só para o administrador: convites e quem usa o app |
| 🎨 Aparência | Tema claro ou escuro |
| 👤 Conta | Senha, **erros do app**, novidades, sair |

## 4. Casal
1. No seu celular: ⚙ → Casal → **Mostrar meu QR Code**.
2. No do par: ⚙ → Casal → **Ler o QR Code** (ou digitar o código).
3. Cada um escolhe o que mostra: **Detalhado**, **Só totais** ou **Pausar**.
4. Para ver: **+ → Casal**. Só gastos são mostrados; entradas, salário, guardados e dívidas ficam privados.
5. Tudo vai criptografado: nem o servidor consegue ler. **Desfazer casal** corta na hora.

## 5. Avisos de contas
- ⚙ → Avisos → ligar. Avisa **3 dias antes, na véspera e no dia, às 9h**.
- Usa o dia de vencimento das contas (Investir → Planejamento).
- O servidor só recebe as **datas**, nunca nomes ou valores.

## 6. Segurança
- Dados ficam **no celular**, criptografados (AES-256) com a sua senha.
- Bloqueia sozinho depois de 5 minutos sem uso. Digital/Face ID opcional.
- **Esqueceu a senha?** Na tela de entrar, toque em **Esqueci a senha** e use o **código de recuperação** (`REC-XXXX-XXXX-XXXX-XXXX`). Você cria uma senha nova e não perde nada.
- O código aparece ao criar a conta. Quem já tinha conta cria em **⚙ → Conta → Código de recuperação**. Guarde num print ou papel: ninguém mais tem esse código, nem o administrador.
- Sem o código e sem a senha, só dá para voltar pelo backup na nuvem.
- **iPhone:** o ícone da tela inicial e o navegador (Safari/Chrome) guardam contas separadas. Use sempre pelo ícone.

## 6.1 Acesso por convite (administrador)
- Conta nova só é criada com um **código de convite** (`FIN-XXXX-XXXX`).
- O administrador gera o código em **⚙ → Administrador → Gerar convite** e manda pelo WhatsApp (botão **Enviar**). A mensagem leva um **link que já abre o app com o código preenchido**: a pessoa só digita o nome e a senha.
- Cancelar um convite pede **dois toques**, para não cancelar sem querer.
- Cada código serve para **1 pessoa** e vale **30 dias**.
- **Bloquear:** a pessoa não abre mais o app (vale na próxima vez que abrir com internet). **Liberar** desfaz.
- **Remover:** tira da lista; para voltar, precisa de um código novo.
- Quem fica **30 dias sem abrir o app** precisa de um código novo. O administrador não vence.
- O app funciona sem internet normalmente. A internet só é usada para conferir o acesso.
- O administrador **nunca** vê os gastos de ninguém: só nome, data de entrada e último acesso.
- Para virar administrador: ⚙ → Conta → **Ativar administrador** → código de ativação (uso único).
- Backup na nuvem, casal e avisos só funcionam para quem está liberado (o servidor confere).

## 7. Backup e restaurar
- **Backup na nuvem:** ⚙ → Segurança e backup. Vai sozinho a cada mudança.
- **Voltar um dia:** no mesmo bloco dá para abrir as versões dos últimos 7 dias.
- **Restaurar em outro celular:** crie a conta no app e, na tela do saldo inicial, toque em **Já usava o app? Restaurar da nuvem** → nome e senha do backup.
- **Backup em arquivo:** ⚙ → Segurança e backup → **Mais opções: backup por arquivo** (baixa um arquivo criptografado).

## 8. Se algo der errado
1. Feche e abra o app de novo (ele se atualiza sozinho).
2. ⚙ → Conta → **Erros do app** → **Copiar para mandar ao Claude** e cole na conversa.
3. ⚙ → Segurança e backup → veja o **Checkup**.
4. Sem internet o app funciona normal; só backup, casal e avisos esperam a conexão.

## 9. O que roda sozinho (grátis)
| O quê | Onde | Quando |
|---|---|---|
| Teste do app + e-mail se falhar | GitHub Actions (`.github/workflows/teste-diario.yml`) | Todo dia, 7h |
| Manter o Supabase acordado | Mesmo teste diário | Todo dia, 7h |
| Avisos de contas | Supabase (função `avisos` + `pg_cron`) | Todo dia, 9h |

- O resultado dos testes fica na aba **Actions** do repositório. Para rodar na hora: Actions → Teste diário → **Run workflow**.
- E-mail de falha: GitHub → Settings → Notifications → **Actions** → marcar e-mail.

## 10. Para quem for mexer no código
- **Código organizado em `src/`:** `src/index.html` (estrutura da tela), `src/css/app.css` (visual) e `src/js/` (uma parte por assunto, na ordem do número).
- **Depois de mudar algo em `src/`:** rode `python3 build.py`. Ele monta o `index.html` final (o app continua sendo 1 arquivo no site) e recalcula a proteção de segurança (CSP). Envie `src/` e `index.html` juntos.
- O teste diário confere se o `index.html` bate com `src/` (`python3 build.py --check`).
- Ao lançar versão nova: mude `VERSAO` (em `src/js/00-inicio.js`) **e** `<meta name="app-versao">` (em `src/index.html`) juntos.
- `sw.js` faz o app abrir sem internet. Pastas: `ocr/` (leitor de foto), `pdf/` (leitor de PDF), `qr/` (leitor de QR Code), `fonts/` (letras).
- **Servidor (Supabase):** o molde completo está em `supabase/schema.sql` (tabelas, funções, permissões e o passo a passo para recriar num projeto novo). A função de avisos está em `supabase/functions/avisos/`. Tabelas: `backups`, `backup_versoes`, `casal`, `avisos`, `acessos`, `convites`, `config`, todas com RLS e sem acesso direto; o app só usa funções. As chaves dos avisos ficam no **Vault**.
- **Publicação:** a cada envio, o GitHub testa o app. Com **Settings → Pages → Source → GitHub Actions**, o site só é atualizado se os testes passarem.
- Backup na nuvem vai **compactado e criptografado** (cerca de 10 vezes menor). O painel Administrador mostra o espaço usado (plano grátis: 500 MB).
- Nunca coloque a chave **secreta** (service_role) no app ou no GitHub. A chave **publishable** pode ficar.
- Licença: todos os direitos reservados (arquivo `LICENSE`). Privacidade e termos: `privacidade.html` e `termos.html`.
