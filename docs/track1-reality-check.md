# Track 1 (Stable Agents LATAM): chequeo de realidad

Investigación del 2026-10-18 (deep research: 18 fuentes, 25 afirmaciones verificadas por votación 3 a 0 salvo indicación). Las reglas pueden cambiar antes del cierre (2026-11-09).

## Veredicto

El enfoque (link público de `ramp.ripio.com` → wARS en la billetera del negocio → el agente concilia) **es la vía que los organizadores recomiendan como la más fácil**. No tener Ramps API no deja afuera. Lo que hoy falla es el estado del proyecto: **una demo 100% simulada no compite**. Las reglas exigen Celo mainnet, identidad ERC-8004 y tag ERC-8021 en cada transacción desde la primera, y el puntaje sale de actividad onchain real.

## Hechos verificados

| Hecho | Fuente |
|---|---|
| "Celo mainnet only (testnet references in your repo are fine)". El tag ERC-8021 "must be implemented"; las transacciones sin tag "can't be counted" y no se pueden etiquetar después. | [loops.house](https://www.loops.house/agents-on-open-rails), [celopedia](https://github.com/celo-org/celopedia-skills/blob/main/skills/celopedia-skill/references/grants-funding.md) |
| "Your project will only be valid with an ERC-8004 identity"; según los organizadores, registrarla lleva "unos minutos". | [loops.house](https://www.loops.house/agents-on-open-rails) |
| Hay cinco criterios de Ripio: mainnet con wFiat real, uso real de wFiat y del stack de Celo, agente autónomo y útil, UX usable por una persona real e impacto en LATAM. Se puntúa con una query publicada y un leaderboard en vivo, y la decisión final es de un panel humano que también revisa el repo. | [loops.house](https://www.loops.house/agents-on-open-rails) |
| El link público (`country`, `chain`, `token`, `amount`, `address`) es lo recomendado y no pide credenciales. La Ramps API exige KYB y es solo para personas jurídicas. | [loops.house](https://www.loops.house/agents-on-open-rails), [Luma](https://luma.com/mb3e5jgc) |
| wARS en Celo: `0x0dc4f92879b7670e5f4e4e6e3c801d229129d90d`, 18 decimales. | [celopedia](https://github.com/celo-org/celopedia-skills/blob/main/skills/celopedia-skill/references/grants-funding.md) |
| ERC-8004 en mainnet: IdentityRegistry `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` y ReputationRegistry `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63`. En Celo Sepolia: `0x8004A818BFB912233c491871b3d84c89A494BD9e` (Identity) y `0x8004B663056A597Dffe9eCcC1965A193B7388713` (Reputation), que sirven para ensayar. | [docs.celo.org](https://docs.celo.org/build/agents/8004), [erc-8004-contracts](https://github.com/erc-8004/erc-8004-contracts) |
| El registro es `register(agentURI)` con viem, que mintea un ERC-721 a `msg.sender` y fija `agentWallet = msg.sender`. Con un `agentURI` por HTTPS alcanza una sola transacción. La clave que registra queda publicada como dirección del agente. | [docs.celo.org](https://docs.celo.org/build/agents/8004), [EIP-8004](https://eips.ethereum.org/EIPS/eip-8004) |
| El tag sale del SDK oficial `@celo/attribution-tags` (0.x, de cLabs): `walletClient.extend(withAttribution(code))`, o bien `dataSuffix: toDataSuffix(code)` (viem ≥ 2.45, también en `useWriteContract` de wagmi). Solo cuenta el código asignado al inscribirse. | [attribution-tags](https://github.com/celo-org/attribution-tags) |
| El sufijo va al final del calldata y los contratos lo ignoran (votación 2 a 1 en parte). No conviene copiar el ejemplo hex de Base. | [Base](https://docs.base.org/specifications/builder-codes/overview) |
| Ripio anuncia ramps "sin costo" en la plataforma, pero aclara que "Network costs may apply" (confianza media). | [blog Celo](https://blog.celo.org/ripio-deploys-wfiat-stack-on-celo-with-no-cost-on-off-ramps-expanding-the-leading-stablecoin-9f801b82b899) |

## Hipótesis y preguntas abiertas

- **La transferencia de Ripio no llevará nuestro tag.** Es una inferencia: si toda la actividad es "Ripio deposita", el leaderboard podría no atribuirnos nada. Para que cuente, el agente necesita transacciones propias y etiquetadas: el registro, barridos, liquidar vía offramp, pagos a proveedores. Falta confirmar cómo cuenta la query los depósitos entrantes.
- **Conciliación por monto exacto con centavos únicos:** no está validada. Ninguna fuente confirma que el link acepte `85000.01` ni que acredite el monto exacto sin descontar costos.
- **Sin respuesta con fuentes:** el monto mínimo del on-ramp en Argentina, el costo real del gas, si el pagador necesita KYC o cuenta en Ripio, y si la transferencia desde Mercado Pago al CVU funciona.
- **"Solo cuentan usuarios independientes":** fue refutada en la votación (1 a 2), así que no está confirmada pero tampoco descartada.
- **Competencia:** no se encontraron fuentes sobre otros proyectos ni sobre el detalle de alcancia. La opinión es que copiar el enfoque del organizador valida la vía técnica pero no diferencia. Lo que diferencia es lo que el agente hace solo después del cobro.
- **Alternativas a conciliar por monto:**
  - Una dirección o contrato receptor por cobro, que reenvía y emite un evento con el id del cobro. Es más robusta, pero suma gas y complejidad.
  - Monto único con centavos, que es lo actual.
  - Ventana de tiempo más monto.
  - Un memo no es viable, porque el link no lo expone.

## Prioridades (3 semanas)

1. Inscribirse y obtener el código de atribución. Integrar `@celo/attribution-tags` **antes de cualquier transacción**.
2. Registrar el agente en ERC-8004 en mainnet (antes, ensayar en Sepolia).
3. Lograr autonomía: el agente concilia y avisa solo, y firma acciones propias etiquetadas (por ejemplo, liquidar).
4. Hacer un cobro real chico de punta a punta con el link de Ripio, para validar decimales, costos y KYC. Es decisión del dueño del proyecto.
5. Deploy público y una UX usable por una persona real.
