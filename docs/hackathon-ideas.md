# Hackathon "Agents on Open Rails" — investigación de ideas

Fecha: 2026-10-09 · Origen: workflow `deep-research` (102 agentes, 25 claims verificados: 16 confirmados, 9 refutados)
Idea base: agente de routing de remesas pequeñas ARS↔BRL sobre stablecoins locales en Celo.

> **Cómo leer este documento.** La Parte 1 son hechos verificados (con fuente y confianza). La Parte 2 son
> **hipótesis mías** (ideas), no hallazgos de la investigación. La Parte 3 lista lo que **no** se pudo verificar.
> Nada de la Parte 2 está respaldado por datos de mercado: ese punto quedó sin cubrir.

---

## Parte 1 — Lo que está verificado

### 1.1 Estructura del hackathon (confianza: alta)
- Premios: US$5.000, **pagados en CELO** (no en USD fijo). Cierre: **2026-11-09 09:00 GMT**.
- Track 1 Stable Agents LATAM (Celo × Ripio): US$2.000 (DevGrants: 1.500 / 500).
- Track 2 Open Corridors: US$2.000 (DevGrants: subtracks 750 / 250).
- Track 3 Build with buy: US$1.000.
- El volumen on-chain cuenta para el puntaje, junto con la fortaleza del proyecto y el encaje con Celo.
- Fuentes: https://luma.com/mb3e5jgc · https://luma.com/uk27jw1q · https://devgrantsdaily.com/items/2026-10-06-celo-agents-on-open-rails-hackathon/
- Matiz: el mapeo de montos a tracks es inferencia; la página canónica `loops.house` no se consultó.

### 1.2 Competencia previa (confianza: alta)
- Hackathon anterior (Onchain Agent, 73 proyectos): 1º **Remit Route** (US$2.5K), 2º AjoAI (US$1K), 3º Monipay (US$500).
- Remit Route es un agente always-on de finanzas personales con reglas en lenguaje natural y sin firma manual.
  Ninguna fuente lo describe como corredor ARS/BRL ni con stablecoins locales.
- Conclusión: un "agente de remesas" genérico **no es novedoso**; el hueco LATAM + moneda local sigue abierto.
- Fuente: https://x.com/Celo/status/2067263161288310982 (2026-06-17).
- Matiz: parte de su victoria vino del ranking en el registro 8004.

### 1.3 Tokens wFiat (confianza: alta)
- wARS, wBRL, wMXN, wCOP, wPEN, wCLP de Ripio. 18 decimales. Misma dirección en cadenas EVM, incluida Celo.
- wARS `0x0dc4f92879b7670e5f4e4e6e3c801d229129d90d` · wBRL `0xd76f5faf6888e24d9f04bf92a0c8b921fe4390e0`
- Un verificador llamó `decimals()` en `forno.celo.org` (= 18) y `eth_getCode` en Ethereum mainnet. Otras cadenas no se chequearon una a una.

### 1.4 Facilitator x402 nativo de Celo (confianza: alta)
- Soporta **wARS, wBRL y wCOP** sin paso de conversión, además de USDC, USD₮ y USA₮.
- **wMXN, wCLP y wPEN siguen "en el pipeline"** (`skill.md` en vivo, 2026-10-09: no habilitados). No depender de ellos antes del cierre.
- Endpoints: solo `/settle` requiere API key (se genera firmando un mensaje off-chain, sin gas). `/verify` y `/supported` son abiertos.
  Créditos gratis iniciales, luego **US$0.001 por settlement**. Hay rate limit 429 en el plan gratuito.
- Posicionamiento oficial: comercios y devs de AR/BR/CO pueden cobrar a agentes en pesos/reales; los dueños pueden fijar presupuestos del agente en su moneda.
  **El control de presupuesto no es una feature entregada: habría que implementarlo.**
- Fuentes: https://blog.celo.org/celo-becomes-the-first-chain-to-support-local-currency-agentic-payments-with-ripios-wars-wbrl-2eb72540c91e ·
  https://blog.celo.org/usa-agentic-payments-are-now-live-on-celos-native-x402-facilitator-dbb77c731df8 ·
  https://x402.celo.org/skill.md · https://docs.celo.org/build-on-celo/build-with-ai/x402
- Ojo: `docs.celo.org` está desactualizada respecto a los tokens. Re-chequear `x402.celo.org/skill.md` antes del cierre.
- "Primera cadena" es afirmación de marketing del proveedor.

### 1.5 Rampa de Ripio (confianza: alta)
- Ramps API B2B: requiere KYB, solo empresas.
- `ramp.ripio.com` con query params (`country`, `chain`, `token`, `amount`, `address`): **sin credenciales de API**. Con los cuatro primeros, el usuario salta el formulario.
  Ejemplo: `https://ramp.ripio.com/?country=AR&chain=42220&token=WARS&amount=10000&address=0x...`
- Es la vía viable para un hacker individual.
- Matiz: "sin credenciales" no equivale a "sin KYC". El usuario final probablemente pasa el KYC de Ripio dentro del flujo (no confirmado).

### 1.6 MCP (confianza: alta para x402, media para el MCP de Celo)
- Guía oficial x402: un MCP server en TypeScript que envuelve axios con `@x402/axios`. Al recibir HTTP 402 firma y reintenta.
  Limitaciones: el ejemplo auto-aprueba pagos (solo testing); `@x402/mcp` tiene tope por defecto de US$1; el ejemplo usa Base Sepolia;
  **firmar exige una clave con fondos**, lo que choca con la regla "sin claves" del spike si se construye el flujo de pago.
  Fuente: https://docs.x402.org/guides/mcp-server-with-x402
- El MCP oficial de Celo es **solo lectura**. Expone balances de CELO/ERC-20/Mento (USDm, EURm, BRLm), red, bloques, gas, gobernanza y staking.
  **No** cubre lectura genérica de contratos, x402, wARS/wBRL de Ripio ni Textile FX. Para eso hace falta viem/RPC directo o un MCP propio.
  Fuente: https://docs.celo.org/build-on-celo/build-with-ai/mcp/celo-mcp (documento sin fecha ni versión).

---

## Parte 2 — Ideas (HIPÓTESIS del analista, no verificadas)

Criterios: construibles en ~4 semanas por una persona, en TypeScript, y con riesgo de liquidez wBRL explícito (sin medir).
"Dep. wBRL" = depende de que haya profundidad real en wBRL; el spike lo decide.

| # | Idea | Qué hace | Track probable | Dep. wBRL | Esfuerzo | Diferenciación |
|---|---|---|---|---|---|---|
| 1 | **Corredor ARS→BRL de punta a punta** (la idea base) | Rampa Ripio → wARS → wBRL (vía USDT) → salida a PIX, con cotización y comparación | 1 (o 2a) | **Alta** | Alto | Media: compite con Textile FX |
| 2 | **Agente con presupuesto en moneda local** | El dueño fija un tope mensual en wARS/wBRL; el agente paga APIs vía x402 sin salir de esa moneda y rinde cuentas | 1 y 3 | Baja | Medio | Alta: la propia Celo dice que el control de presupuesto no está entregado |
| 3 | **Pasarela "cobrá en pesos/reales"** | Middleware para que un dev de AR/BR monetice su API cobrando a agentes en wARS/wBRL (x402) | 1 y 3 | Nula | Medio | Media-alta, pero necesita compradores en la demo |
| 4 | **MCP server de monedas locales (solo lectura)** | Herramientas `get_balance`, `quote_route`, `compare_venues` para wARS/wBRL/wCOP, que el MCP de Celo no cubre | 1 | Baja | Bajo | Media; valiosa como pieza, débil sola |
| 5 | **Bot de Telegram de FX y alertas** | Avisa cuándo conviene convertir, compara cotización on-chain vs referencia y arma el link de `ramp.ripio.com` | 1 | Media | Bajo | Media; buena UX de demo |
| 6 | **Cobro a turistas argentinos en Brasil** | El comercio brasileño cobra, el turista paga en wARS | 1 | Alta | Alto | Alta en el relato, pero la salida a PIX no está verificada |
| 7 | **Tesorería multi-moneda para freelancers** | Recibe en wCOP/wBRL/wARS y rebalancea con reglas | 1 | Media | Medio | Baja: se parece a Remit Route |

### Mi lectura (opinión)
- **La idea 1 sola es la más débil** por lo ya dicho: compite con Textile FX, y su valor depende de un dato que no medimos.
- **La idea 2 es la que mejor combina diferenciación y riesgo bajo.** Usa justo lo que Celo anunció y no entregó, no depende de wBRL y sirve a dos tracks.
- **Una combinación razonable:** núcleo = idea 2, con la idea 4 como interfaz para agentes y la idea 5 como cara visible.
  El corredor ARS→BRL (idea 1) queda como **capacidad opcional** que se activa solo si el spike muestra profundidad en wBRL.
- Tensión a resolver: pagar por x402 exige una clave con fondos. En el spike no hay claves; en el producto sí. Hay que decidir cómo se custodia (por ejemplo, wallet de sesión con tope).
- Riesgo: la demo de la idea 2 necesita al menos un servicio que cobre en wARS/wBRL. Hay que construirlo (idea 3) o encontrarlo.

---

## Parte 3 — Lo que NO se verificó

- **Datos de mercado y dolor de usuario** (tamaño de remesas AR↔BR, costos, comportamiento, turistas con PIX, nómadas, comercios fronterizos): sin claims verificados.
- **Criterios de juicio por track.** Los claims sobre Track 1 (funcionalidad, utilidad, UX, adopción on-chain), Track 2a (volumen cotizado, profit, innovación) y Track 3 (problema, profundidad de integración, demanda para buy) votaron 1-2 en esta ronda.
  La ronda anterior había dado 3-0 al mismo tweet para los premios y la estructura, no para los criterios. **No los trates como confirmados.** Confirmá en el Telegram de DevRels o en `loops.house`.
- **Textile FX:** el volumen "10M+" y el carácter "no AMM" no se confirmaron en esta ronda (fuentes: tweet y un video de YouTube).
- **Liquidez de wBRL:** sigue sin medirse. Es el dato que decide la idea 1.
- **Hackathons previos de Ripio, x402 o LatAm:** solo se cubrió un hackathon (el ganador Remit Route).
- **Interfaces:** no hay análisis verificado de bots de Telegram/WhatsApp ni widgets; lo que aparece arriba es criterio mío.
- **Salida a PIX desde wBRL:** no hay evidencia sobre cómo se hace ni a qué costo.

### Afirmaciones refutadas (no usar)
- "El facilitator de Celo solo liquida USDC/USDT" (0-3). Es falso: soporta wARS/wBRL/wCOP.
- "Con wARS en x402 haría falta `allowedAssets` y un facilitator propio" (0-3). La página de x402.org simplemente no menciona Celo.
- "Ripio recomienda `ramp.ripio.com` a individuos y la API B2B exige empresa" según un video de YouTube (0-3): la afirmación quedó sin respaldo en esa fuente, aunque la Parte 1.5 sí está confirmada por la página del organizador.
- "Textile FX no es un AMM y se pueden combinar los tracks Ripio y Textile" (0-3): sin respaldo.
- Montos 1.500 / 500 de Track 1 según el video de YouTube (0-3): usar la cifra de Luma (US$2.000 el pool) y tratar el desglose como variable entre fuentes.

---

## Próximos pasos sugeridos

1. Ejecutar el spike `spike-onchain-liquidity` (bloques 1 a 2 de `tasks.md`) para medir wBRL.
2. Preguntar en el Telegram de DevRels (en inglés): criterios exactos de Track 1, si basta una wFiat, y si x402 es requisito.
3. Decidir el núcleo entre las ideas 1 y 2 con los datos del spike.
4. Cuando haya decisión, abrir el cambio `stable-router-agent` en OpenSpec.
