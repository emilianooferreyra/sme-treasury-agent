# Hackathon "Agents on Open Rails" — ronda 3: cómo destacar

Fecha: 2026-10-13 · Origen: workflow `deep-research` (100 agentes, 25 claims: 20 confirmados, 5 refutados) + verificación manual con `curl`.
Continúa `hackathon-ideas.md` y `hackathon-ideas-round2.md`. Objetivo del usuario: **destacar** con algo terminable (una persona, TypeScript, ~4 semanas).

> Parte 1 = hechos verificados con fuente y fecha. Parte 2 = ideas e hipótesis mías. Parte 3 = lo que no se verificó.

---

## Parte 1 — Hechos verificados

### 1.1 Lo que el organizador muestra en la Builder Session (fuente primaria)
Fuente: https://arturogrande.com/builder-session (HTML descargado con `curl`, 2026-10-13).

- Sección **"IDEAS — para arrancar, no son obligatorias"** (texto literal):
  - **Cobrador:** "Emite cobros en wARS, avisa al cliente por WhatsApp y concilia cuando entra el pago."
  - **Remesas sin dólar:** "Manda wARS a Brasil y llega como wBRL, sin pasar por USD en el medio."
  - **Ahorro automático:** "Separa un porcentaje de cada cobro y lo aparta apenas entra."
  - **Pago a proveedores:** "Paga facturas recurrentes en la moneda de cada país, con límites que vos definís."
  - **Gastos compartidos:** "Divide los gastos de un viaje y liquida a cada uno en su moneda."
  - **Comercio en el chat** (bot de Telegram que vende y cobra en moneda local).
  - **Nota de método:** el workflow refutó esta lista (1-2), pero esa refutación es **errónea**: el texto está en el HTML.
- **Prompt maestro** (verificado 3-0): usar **eve** (Vercel, beta, `eve.dev/llms.txt`), la skill **Celopedia**, viem y fee abstraction, wARS en mainnet, etiqueta **ERC-8021** en cada transacción (SDK `github.com/celo-org/attribution-tags`), identidad **ERC-8004** desde la wallet del agente, "primero proponé la arquitectura" y deploy en Vercel.
- Consecuencia (inferencia): esta lista y este prompt se muestran en **seis ciudades** el mismo día. Las seis ideas, y sobre todo "remesas sin dólar", van a estar repetidas.

### 1.2 Antecedentes premiados en Celo (fuente primaria: newsletter Celo Devs)
- **Onchain Agents:** 1.º RemitRoute (agente de finanzas personales que ejecuta una regla en lenguaje natural, sin firmas manuales; también 1.º en ranking 8004scan), 2.º AjoAI, 3.º Monipay.
- **Build Agents for the Real World V2** (2026-03-27): Track 1 → 1.º Agentopolis, 2.º SocialClaw, 3.º Toppa y AgentHands. Track Infra → 1.º Celo8004 (explorer de agentes ERC-8004).
- **Agentic Payments & DeFAI** (jul–ago 2026): tracks "Most Revenue Generated" y "Most x402 Payments". Celo premia **transacciones reales**, no prototipos (confianza media).
- Fuentes: https://celo-devs.beehiiv.com/p/congrats-onchain-agents-hackathon-winners · https://celo-devs.beehiiv.com/p/congrats-winners-build-agents-for-the-real-world-v2-results-are-out

### 1.3 Ripio Bridge (fuente primaria: https://bridge.ripio.com/developers, 2026-10-13)
- Puente **burn-and-mint**: `approve` + `depositForBridge()` en origen; el operador mintea en destino (un mint por depósito).
- Contrato `BridgeDeposit` en la misma dirección en todas las cadenas: `0x465e642387d3d73a57CDc1368fFA53A800bA5D47` (**no verificado on-chain por nosotros**).
- Cadenas: Ethereum, Base, World Chain, BNB, Polygon, Gnosis, Celo, HyperEVM (solo wARS/wBRL) y Arc.
- API pública de estado: `GET bridge.ripio.com/api/operations/{txHash}?chainId=` y `/api/operations?address=...&pending=true`.
- Fee fija por ruta y **cap diario de mint** por destino (lo que excede queda en cola). Hay que consultar `routeConfigs(token, destChainId)` antes de asumir una ruta.

### 1.4 Off-ramp de Ripio (fuente primaria: https://ramp.ripio.com/offramp)
- Vende cripto y deposita moneda local en la cuenta bancaria "en minutos" (promesa de marketing).
- Monedas listadas: **ARS, BRL, COP, MXN** (no CLP ni PEN). KYC/AML lo hace Ripio; no requiere KYB.
- **No dice si paga por PIX**, ni límites ni costo real.

### 1.5 Dolores de usuarios (fuentes secundarias)
- **Turistas AR en Brasil: el dolor ya está resuelto.** Unos 9M de pagos Pix en enero de 2025 (≈US$8M/día) desde Lemon, Belo, Cocos, Takenos, Fiwind, Plus; a fines de 2025 también Mercado Pago, Brubank, Prex, Binance Pay y Bybit Pay. Datos de kamiPay (proveedor con interés).
  Fuentes: https://www.primeraedicion.com.ar/nota/100969730/argentinos-gastan-con-pix-el-equivalente-a-unos-8-millones-de-dolares-por-dia-en-brasil/ · https://www.c5n.com/tecnologia/verano-2026-como-conviene-pagar-brasil-evitar-el-dolar-tarjeta-n222866
- **Freelancers AR:** 93% retira en dólares y ~6% en stablecoins (datos de Deel, may 2025–abr 2026). Quieren dólares, no pesos tokenizados.
  Fuente: https://www.forbesargentina.com/innovacion/stablecoins-opcion-preferida-freelancers-cobrar-exterior-n91914
- **x402:** solo 0,6%–7,5% del comercio filtrado parece agéntico (TRM Labs, 2026-09-09). Contrapartes reales son un diferenciador.

### 1.6 Refutados (no usar)
- Que la demo de evaluación exija un formato de cuatro partes (0-3).
- Que la inscripción pase por la skill "Celo Builders" con tag `celo_...` (0-3; era de otro hackathon).
- Cotización "dólar tarjeta ARS 1.915,50" (0-3).

---

## Parte 2 — Ideas (hipótesis mías)

### Diagnóstico
1. El corredor ARS→BRL **para turistas** no destaca: el dolor ya lo resuelven apps grandes y además es la idea n.º 2 del organizador.
2. Destacar no exige inventar una idea nueva. Exige **tomar un caso de la lista y resolver la parte difícil** que el resto va a saltear: el pagador sin cripto, la conciliación, los límites, el multi-moneda.
3. La pieza menos explotada que encontramos: **`ramp.ripio.com` acepta `address` de destino**. Un pagador con pesos en el banco puede pagar **directo a la wallet de otra persona** sin tener cripto (KYC dentro de Ripio). Eso baja la barrera de UX más grande.

### Idea A — Cobrador para profesionales y pymes (Track 1) · RECOMENDADA
- **Usuario real:** un profesional o comercio argentino que cobra a clientes que **no tienen cripto** (clases, consultorio, alquiler temporario, servicios).
- **Qué hace el agente, solo:**
  1. Recibe "cobrale $45.000 a Juan por la clase de marzo" (Telegram).
  2. Genera un **link de pago** = URL de `ramp.ripio.com` con `amount` y `address` de la wallet del cobrador. Juan paga desde su banco con Ripio; no ve cripto.
  3. Escucha eventos `Transfer` de wARS on-chain y **concilia**: qué cobro se pagó, cuál parcial, cuál vencido.
  4. Manda recordatorios a los vencidos con reglas ("a los 3 días, a los 7").
  5. Opcional: aparta un % de cada cobro (idea "Ahorro automático") o lo convierte a USD₮ vía Textile si el usuario lo pide.
- **Piezas Celo/Ripio:** wARS, rampa con `address`, eventos on-chain, ERC-8004, ERC-8021 en las tx del agente (apartado / conversión).
- **Por qué destaca:** UX para una persona real **en las dos puntas**; conciliación automática (lo que de verdad duele en una pyme); no depende de la liquidez de wBRL.
- **Riesgos:** confirmar que el on-ramp a una `address` ajena funciona y qué KYC pide al pagador; las tx etiquetadas solo las genera el agente (apartados, conversiones), no los pagos entrantes.
- **¿Existe?** Hay cobradores fiat (Mercado Pago, links de pago). En wFiat on-chain con conciliación por agente, no encontramos antecedentes premiados.

### Idea B — Pago a proveedores en otra moneda (Track 1 + Textile 2A)
- **Usuario real:** pyme argentina que paga a un proveedor en Brasil (o Colombia, México) todos los meses.
- **Agente:** guarda facturas recurrentes en BRL; cuando vence, cotiza wARS→USD₮→wBRL en Textile, ejecuta **dentro de límites** (máximo por pago, tipo de cambio peor aceptable, ventana de tiempo) y paga a la wallet del proveedor; el proveedor retira con `/offramp` (BRL listado).
- **Por qué destaca:** es **el corredor reenfocado a B2B**, el segmento que la investigación marca como no cubierto por las apps de turistas. Suma volumen ejecutado en Textile (criterio 2A).
- **Riesgos:** liquidez de wBRL en Textile (sin medir); PIX no confirmado; necesita un proveedor real que acepte wBRL.

### Idea C — Gastos compartidos multi-moneda (Track 1)
- **Usuario real:** grupo de amigos de distintos países (AR/BR/CO/MX) en un viaje.
- **Agente:** bot en el grupo de Telegram que anota gastos, calcula las **liquidaciones mínimas** y cobra/paga a cada uno en su moneda, convirtiendo vía Textile cuando hace falta.
- **Por qué destaca:** demo social y simpática, fácil de entender en 30 segundos.
- **Riesgos:** compite con Splitwise; si todos son argentinos, no hay multi-moneda; depende de Textile para BRL/COP/MXN.

### Idea D — Consolidador multichain de wFiat (Track 1, más técnica)
- **Usuario real:** quien tiene wFiat repartido en Base/Polygon/Celo (o cobra en otra cadena).
- **Agente:** detecta saldos wFiat en otras cadenas, los trae a Celo con Ripio Bridge, sigue el estado con la API pública y maneja caps diarios y colas.
- **Por qué destaca:** usa una pieza que casi nadie va a tocar.
- **Riesgos:** demanda dudosa (¿quién tiene wFiat fuera de Celo?); usuario real difícil de mostrar. Mejor como **módulo** de A o B que como proyecto.

### Comparación
| | A Cobrador | B Proveedores | C Gastos | D Bridge | Corredor turistas | Filler Textile |
|---|---|---|---|---|---|---|
| Destaca vs otros participantes | Alta (si resuelve pagador sin cripto + conciliación) | Media-alta | Media | Alta pero nicho | **Baja** | Media |
| Depende de liquidez wBRL | No | Sí | Parcial | No | Sí | Sí |
| Usuario real demostrable | Sí (tú + un cliente) | Difícil | Sí | Difícil | Sí | No aplica |
| Capital propio en riesgo | Bajo | Bajo | Bajo | Bajo | Bajo | **Alto** |
| Terminable en 4 semanas | Sí | Sí, con spike previo | Sí | Sí | Sí | Dudoso |

### Veredicto sobre el corredor
- **Como corredor para turistas: no.** El dolor está resuelto y es la idea más obvia de la lista.
- **El trabajo del corredor no se pierde:** la cotización wARS→USD₮→wBRL y el uso de Textile son exactamente el módulo de conversión de la Idea B (y opcional en A y C).
- **Recomendación:** Idea A como núcleo (no depende de nada sin medir), con la conversión vía Textile como extensión si el spike sale bien. Si prefieres quedarte cerca del corredor, la Idea B es la versión que sí destaca.

---

## Parte 3 — No verificado / preguntas abiertas
- Si el on-ramp a una `address` de terceros funciona en la práctica y qué KYC pide al pagador.
- Si `/offramp` paga BRL por PIX, con qué límites, costo y tiempo.
- Rutas activas de Ripio Bridge hacia/desde Celo (`routeConfigs`), fee y cap reales.
- Qué otros proyectos ya se están construyendo en este hackathon (galería de loops.house no revisada).
- Liquidez de wBRL en Textile FX (spike pendiente).
- Demanda B2B ARS→BRL no cubierta por Mercado Pago/Brubank/kamiPay.
