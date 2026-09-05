import nacl from 'tweetnacl';
import { decodeBase64, encodeBase64, decodeUTF8, encodeUTF8 } from 'tweetnacl-util';
import { supabase } from '@/lib/supabase';

// Keypair type for easier use
export interface E2EEKeyPair {
  publicKey: string; // Base64
  privateKey: string; // Base64
}

/**
 * Generates a new X25519 key pair for Box encryption.
 */
export function generateKeyPair(): E2EEKeyPair {
  const pair = nacl.box.keyPair();
  return {
    publicKey: encodeBase64(pair.publicKey),
    privateKey: encodeBase64(pair.secretKey),
  };
}

/**
 * Encrypts a string message using my private key and their public key.
 * Returns the ciphertext and the nonce (both base64 encoded).
 */
export function encryptMessage(
  text: string,
  myPrivateKeyBase64: string,
  theirPublicKeyBase64: string
): { ciphertext: string; nonce: string } | null {
  try {
    const mySecretKey = decodeBase64(myPrivateKeyBase64);
    const theirPublicKey = decodeBase64(theirPublicKeyBase64);
    const messageUint8 = decodeUTF8(text);
    const nonce = nacl.randomBytes(nacl.box.nonceLength);

    const encrypted = nacl.box(messageUint8, nonce, theirPublicKey, mySecretKey);

    return {
      ciphertext: encodeBase64(encrypted),
      nonce: encodeBase64(nonce),
    };
  } catch (error) {
    console.error("Encryption failed", error);
    return null;
  }
}

/**
 * Decrypts a base64 ciphertext using my private key and their public key.
 * Returns the plain string.
 */
export function decryptMessage(
  ciphertextBase64: string,
  nonceBase64: string,
  myPrivateKeyBase64: string,
  theirPublicKeyBase64: string
): string | null {
  try {
    const mySecretKey = decodeBase64(myPrivateKeyBase64);
    const theirPublicKey = decodeBase64(theirPublicKeyBase64);
    const ciphertext = decodeBase64(ciphertextBase64);
    const nonce = decodeBase64(nonceBase64);

    const decrypted = nacl.box.open(ciphertext, nonce, theirPublicKey, mySecretKey);
    if (!decrypted) return null;

    return encodeUTF8(decrypted);
  } catch (error) {
    console.error("Decryption failed", error);
    return null;
  }
}

/**
 * Fetches the user's private key from Supabase (Cloud-Synced).
 * RLS ensures only the owner can fetch this.
 */
export async function fetchMyPrivateKey(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('user_private_keys')
    .select('private_key')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return data.private_key;
}

/**
 * Fetches a user's public key.
 * Anyone authenticated can fetch this.
 */
export async function fetchPublicKey(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('user_public_keys')
    .select('public_key')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return data.public_key;
}

/**
 * Generates a new key pair and uploads it to Supabase.
 * Returns the generated key pair.
 */
export async function generateAndUploadKeys(userId: string): Promise<E2EEKeyPair | null> {
  const pair = generateKeyPair();

  // Insert Public Key
  const { error: pubError } = await supabase
    .from('user_public_keys')
    .insert({ user_id: userId, public_key: pair.publicKey });

  if (pubError) {
    console.error("Failed to upload public key", pubError);
    return null;
  }

  // Insert Private Key
  const { error: privError } = await supabase
    .from('user_private_keys')
    .insert({ user_id: userId, private_key: pair.privateKey });

  if (privError) {
    console.error("Failed to upload private key", privError);
    // Ideally we should rollback the public key insert, but for simplicity we log it.
    return null;
  }

  return pair;
}
