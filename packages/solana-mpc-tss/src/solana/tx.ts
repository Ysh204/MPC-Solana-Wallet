import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';

/**
 * Create a Solana transfer transaction
 * @param connection The Solana connection
 * @param from The sender's public key
 * @param to The recipient's public key  
 * @param amount The amount to transfer in SOL (will be converted to lamports)
 * @returns Promise resolving to a Transaction
 */
export async function createTransferTx(
  connection: Connection,
  from: PublicKey,
  to: PublicKey,
  amount: number
): Promise<Transaction> {
  const lamports = Math.round(amount * LAMPORTS_PER_SOL);
  const { blockhash } = await connection.getLatestBlockhash();
  const tx = new Transaction({ recentBlockhash: blockhash, feePayer: from }).add(
    SystemProgram.transfer({ fromPubkey: from, toPubkey: to, lamports })
  );
  return tx;
}