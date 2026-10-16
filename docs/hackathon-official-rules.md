# Reglas oficiales — Agents on Open Rails

Fuente: https://loops.house/agents-on-open-rails · consultada el 2026-10-10 con WebFetch.
**Advertencia de método:** WebFetch resume la página con un modelo pequeño; no es una copia literal.
Antes de apoyar decisiones grandes, releer la página original. Esta fuente **reemplaza** lo que en `hackathon-ideas.md`
y `hackathon-ideas-round2.md` figuraba como "criterios no confirmados".

## Tracks y premios
| Track | Sponsor | Premios |
|---|---|---|
| Stable Agents: LatAm | Ripio × Celo Core Co. | 1º US$1.500 · 2º US$500 |
| Open Corridors: Textile FX | Textile | 1º US$750 · 2º US$250 |
| Open Corridors: USA₮ con x402 | Celo x402 (x402.celo.org) | 1º US$750 · 2º US$250 |
| Build with buy | buy (usebuy.ai) | US$1.000 repartidos en 5 proyectos |

Pool total US$5.000. Chainstack da 3 meses de plan Growth gratis a cada equipo.

## Qué pide cada track
- **LatAm.** Cinco criterios fijados por Ripio:
  1. opera en mainnet con un token wFIAT real;
  2. uso real de wFIAT y del stack de Celo;
  3. un agente autónomo y útil;
  4. UX usable por una persona real;
  5. impacto claro para LatAm.
- **Open Corridors, Textile FX.** Agentes que cotizan y liquidan FX en Textile (mercado de FX on-chain permissionless: cNGN, wARS, wBRL y USDC contra USD₮).
  Criterios: P&L de la estrategia, volumen cotizado y ejecutado, originalidad.
- **Open Corridors, USA₮ con x402.** Productos con usuarios reales que liquidan USA₮ por el facilitador x402 de Celo.
  Criterios: liquidación real entre partes independientes, con la moneda justificada por el usuario al que sirve.
- **Build with buy.** Criterios: problema que resuelve y profundidad de integración, entendida como **llamadas pagas verificadas a servicios que el equipo no controla**. Los usuarios independientes son un calificador.

Decide un panel humano, con datos de consultas y la lectura de un "juez de Loops" sobre el repositorio.

## Fechas
- 6 oct: kick-off · 8 oct: livestream de Ripio wFIAT.
- **9 nov, 09:00 GMT: cierre de registro y de entrega.**
- 13 nov: anuncio de ganadores.

## Reglas de elegibilidad
- **Solo Celo mainnet** (referencias a testnet en el repo están permitidas).
- Repositorio público de GitHub informado al registrarse, que siga existiendo al juzgar.
- **Etiqueta de atribución** implementada **antes** de la primera transacción que quieras que cuente. No se puede completar después.
- **Identidad de agente ERC-8004 obligatoria en todos los tracks**, registrada desde la wallet del agente antes del cierre.
- El gas patrocinado no cuenta como contribución del equipo (los flujos sin gas no se penalizan).
- "Usuario independiente": una wallet que no controlás, que no fue fondeada por vos ni por tu fondeador principal, y que tenía actividad propia en Celo antes del hackathon.
- **El código debe escribirse durante el hackathon.**
- Se puede entrar a varios tracks, pero ganar un solo premio por track.

## Dudas abiertas
- "Paxbot" **no aparece** en esta página ni en una búsqueda web. Origen del dato: pendiente de confirmar con quien lo escribió.
- Cómo se implementa exactamente la etiqueta de atribución y el registro ERC-8004.
- Si el registro de la Luma de la Builder Session es independiente del registro del hackathon (parece que sí: este último es en Loops).

---

## Actualización 2026-10-10 (citas textuales de la página y texto pegado por el usuario)

La advertencia de arriba queda superada: los criterios y reglas se releyeron **textuales** del FAQ de `loops.house`,
y el texto de la página (Prizes/Ripio/Textile) lo pegó el usuario completo.

### Cómo se decide (textual)
- "Each track is scored by a query we publish before the window opens, and the live leaderboard runs on that same query."
- "A human panel makes the final call, using query data plus the Loops judge's reading of your repository."
- Build with buy: "verified paid calls from your tagged wallet into services you don't control, and the growth they create for those services." / "Spamming the cheapest call scores nothing."

### Etiqueta y identidad
- Etiqueta de atribución = código **ERC-8021** que la app agrega al calldata de **cada transacción**. Va en el código que construye y envía las transacciones (frontend o backend del agente), **no** en el contrato.
  Sin etiqueta no se cuenta, y no se puede agregar después. La etiqueta se emite al inscribirse.
- ERC-8004: registro de identidad del agente. "It takes a few minutes and is required for every track." Sin esa identidad el proyecto no es válido.

### Ideas que Ripio lista para Track 1 (texto de la página)
- APIs de pago por llamada y servicios de agentes con precio en pesos o reales, sobre x402.
- Nómina, pagos a freelancers y suscripciones que liquidan en moneda local.
- **"Transfers that move directly between LatAm currencies, such as wBRL to wARS."**
- Agentes de comercio que facturan, cobran y concilian en wARS, wMXN o wCOP.
- Agentes de ahorro y presupuesto para hogares en su propia moneda.
- Flujos de consumo tipo MiniPay.

### Datos adicionales de la página
- wARS, wBRL y wCOP ya liquidan por el facilitador x402; wMXN, wPEN y wCLP están "live for transfers and payments" (no por x402).
- Ripio afirma que las wFIAT están respaldadas 1:1 por moneda local y que las rampas on/off son gratuitas (afirmación del sponsor, no verificada por terceros).
- Textile FX, ejemplos del sponsor: "smarter pricing, or treasury agents that manage a business's currency exposure".
- Tema central de la página: "demand: agents with somebody real on the other side of the transaction".
- Problema que plantea Ripio: "moving money often means converting through the dollar first, with fees at every step".

---

## Actualización 2026-10-13: slides y "prompt maestro" del organizador
Fuente: https://arturogrande.com/builder-session (WebFetch, 2026-10-13; resumen de modelo, no copia literal).

### Ideas de caso de uso que sugiere el organizador (opcionales)
- Cobrador: emite cobros en wARS, avisa por WhatsApp y concilia cuando llega el pago.
- **Remesas sin dólar: manda wARS a Brasil y llega como wBRL sin pasar por USD.** (= nuestro corredor; lo van a hacer otros)
- Ahorro automático: aparta un % de cada pago al entrar.
- Pago a proveedores: paga facturas recurrentes en la moneda de cada país, con límites.
- Gastos compartidos: divide gastos de viaje y liquida a cada uno en su moneda.
- Comercio por chat: bot de Telegram que vende y cobra en moneda local.
- Textile: "market making, route cross-border payments at the best price, or run their own strategy".

### Stack recomendado por el organizador
- **Celopedia** (skill para coding agents, 150+ contratos verificados): `npx skills add celo-org/celopedia-skills` · https://celopedia.celo.org
- **eve** (Vercel, Apache-2.0, beta): agentes como carpetas de Markdown + tools TS; workflows durables, canales (Slack, Discord, web, Telegram), cron; deploy en Vercel; Node 24+. `npx eve@latest init mi-agente` · https://eve.dev/llms.txt
- **Attribution SDK (ERC-8021):** https://github.com/celo-org/attribution-tags — se agrega en el wallet client, no en el contrato.
- **ERC-8004:** https://docs.celo.org/build-on-celo/build-with-ai/8004 · visible en https://8004scan.io
- Fee abstraction: gas pagable en USD₮/USDC. Si un relayer paga el gas, no cuenta como contribución: declararlo.
- x402: el facilitador paga el gas (EIP-3009); acepta USA₮, USDC, USD₮, wARS, wBRL, wCOP. Lista: https://api.x402.celo.org/supported
- buy: https://usebuy.ai · skill https://github.com/celo-org/buy-skill (beta, pagos finales; el gateway paga gas).
- USA₮ gratis: faucet Google Cloud Web3 (5 USA₮, verificación con Self).
- Office hours: jueves 09:00 (hora AR). Grants Prezenti: US$165K esta temporada.
- Cierre: lunes 9 nov 06:00 hora AR (= 09:00 GMT).

---

## Actualización 2026-10-14: prompt maestro completo (pegado por el usuario)
Datos nuevos o que corrigen lo anterior:
- "Cualquier framework de agentes vale" → eve es recomendado, **no obligatorio**.
- Track 1, descripción del organizador: cobran, pagan, ahorran y liquidan en wFiat "**sin pasar por el dólar**". Ojo: Textile cotiza todo contra USD₮.
- Skill de la hackathon: `npx loopshouse add agents-on-open-rails` (Node 20.12+). Agregar la wallet del agente a la entry.
- x402 en Celo: facilitador `https://api.x402.celo.org` (/verify, /settle con API key, /supported, /health). **wARS, wBRL y wCOP liquidan con permit2**; USDC, USD₮ y USA₮ con EIP-3009. (Corrige la suposición previa de que wARS usaba EIP-3009.)
- USA₮ en Celo: `0xD2ab3C9A02DBBAB236BfEC45D1d755DF4267F771` (6 decimales; no verificado on-chain por nosotros).
- Celopedia en Claude Code: `mkdir -p .claude && ln -s ../.agents/skills .claude/skills`.
- Office hours: jueves 12:00 GMT (09:00 AR). Bridges a Celo: https://docs.celo.org/tooling/bridges/bridges
