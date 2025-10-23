

export interface IJwtPayload {
    userId: string,
    email: string,
    role: string,
    iat: number,
    exp: number
}