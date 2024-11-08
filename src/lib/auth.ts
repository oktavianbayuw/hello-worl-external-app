import jwt from 'jsonwebtoken';
import Cookies from 'js-cookie';

// Read the private and public keys
const privateKey = process.env.PRIVATE_KEY 

interface TokenPayload {
  username: string;
  [key: string]: any;
}

export function createToken(payload: TokenPayload): string {
  if (!privateKey) {
    throw new Error('Private key not found');
  }
  return jwt.sign(payload, privateKey, { 
    algorithm: 'RS256',
    expiresIn: '1h'
  });
}

export function verifyToken(token: string, publicKey: string): TokenPayload | null {
  try {
    return jwt.verify(token, publicKey, { algorithms: ['RS256'] }) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function setToken(token: string): void {
  Cookies.set('token', token, { expires: 1 }); // Expires in 1 day
}

export function getToken(): string | undefined {
  return Cookies.get('token');
}

export function removeToken(): void {
  Cookies.remove('token');
}



