"use client";

import { ExternalLink, LoaderCircle, LogOut, Wallet } from "lucide-react";
import { erc20Abi } from "viem";
import { celo } from "viem/chains";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect, useReadContract } from "wagmi";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/core/ui/card";
import { formatWarsBalance, shortAddress } from "../wallet-display";
import { WARS_TOKEN } from "../../../core/celo/wars-token";

/**
 * The business connects the wallet its charges arrive at, and sees its real wARS balance on Celo.
 * Read-only: nothing is signed.
 */
export function WalletPanel() {
  const { address, isConnected } = useAccount();
  const { openConnectModal, connectModalOpen } = useConnectModal();
  const { disconnect } = useDisconnect();
  const balance = useReadContract({
    address: WARS_TOKEN,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: celo.id,
    query: { enabled: Boolean(address) },
  });

  if (!isConnected || !address) {
    // The modal (RainbowKit) lists the wallets and explains what a wallet is; this button opens it.
    // openConnectModal is undefined until RainbowKit is ready.
    return (
      <Button size="lg" variant="outline" disabled={!openConnectModal || connectModalOpen} onClick={openConnectModal}>
        {connectModalOpen ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Wallet aria-hidden="true" />}
        Conectar billetera
      </Button>
    );
  }

  return (
    <Card size="sm" className="w-full max-w-sm text-left">
      <CardHeader>
        <CardDescription>Tus cobros llegarán a</CardDescription>
        <CardTitle className="font-mono">{shortAddress(address)}</CardTitle>
        <CardAction>
          <Badge variant="secondary">Celo</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-1">
        <p className="text-sm text-muted-foreground">Saldo en wARS</p>
        <p className="text-3xl font-semibold tracking-tight">
          {balance.data === undefined ? (
            balance.isError ? (
              <span className="text-base text-destructive">No se pudo leer el saldo</span>
            ) : (
              <LoaderCircle className="size-6 animate-spin text-muted-foreground" aria-label="Leyendo saldo" />
            )
          ) : (
            formatWarsBalance(balance.data)
          )}
        </p>
      </CardContent>
      <CardFooter className="justify-between gap-2">
        <Button asChild variant="link" size="sm" className="px-0">
          <a href={`https://celoscan.io/address/${address}`} target="_blank" rel="noreferrer">
            Ver en Celoscan <ExternalLink aria-hidden="true" />
          </a>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => disconnect()}>
          <LogOut aria-hidden="true" /> Desconectar
        </Button>
      </CardFooter>
    </Card>
  );
}
