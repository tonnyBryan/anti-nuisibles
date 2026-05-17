import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!

export function generateToken(): string {
    return jwt.sign(
        { role: 'admin' },
        JWT_SECRET,
        { expiresIn: '8h' }
    )
}

export function verifyToken(token: string): boolean {
    try {
        jwt.verify(token, JWT_SECRET)
        return true
    } catch {
        return false
    }
}

export function checkPassword(password: string): boolean {
    return password === ADMIN_PASSWORD
}