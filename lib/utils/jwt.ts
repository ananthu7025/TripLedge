import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'trip-ledge-mobile-secret-key-123';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export async function signToken(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(encodedSecret);
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, encodedSecret);
        return payload;
    } catch (error) {
        return null;
    }
}
