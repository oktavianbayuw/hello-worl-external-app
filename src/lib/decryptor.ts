import * as forge from "node-forge";

interface UserData {
  email: string;
  name: string;
  createdAt: string;
  referer: string;
  accessToken?: string;
  publicKey?: string;
}

export function decryptData(encryptedData: string, privateKeyPem: string): UserData {
  try {
    // Replace URL-safe characters and add padding
    const sanitizedData = encryptedData.replace(/-/g, '+').replace(/_/g, '/');
    const paddedData = sanitizedData.padEnd(sanitizedData.length + (4 - sanitizedData.length % 4) % 4, '=');
    
    const decoded = forge.util.decode64(paddedData);
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

    // Extract parts
    const encryptedKey = decoded.slice(0, 256); // Changed to 256 for 2048-bit RSA key
    const iv = decoded.slice(256, 268); // Adjusted starting index
    const tag = decoded.slice(268, 284); // Adjusted starting index
    const encryptedContent = decoded.slice(284); // Adjusted starting index

    // Decrypt the AES key
    const aesKey = privateKey.decrypt(encryptedKey, 'RSA-OAEP', {
      md: forge.md.sha256.create()
    });

    // Decrypt the content
    const decipher = forge.cipher.createDecipher('AES-GCM', aesKey);
    decipher.start({ iv: iv, tag: forge.util.createBuffer(tag) });
    decipher.update(forge.util.createBuffer(encryptedContent));
    const pass = decipher.finish();
    if (!pass) {
      throw new Error('Failed to decrypt');
    }

    const decrypted = decipher.output.toString();
    return JSON.parse(decrypted);
  } catch (error: any) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data: ' + error.message);
  }
}