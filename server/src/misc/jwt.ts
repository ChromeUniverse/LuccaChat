import jwt from "jsonwebtoken";
import { UserJwtReceived } from "../../types/jwt";

export async function asyncJWTsign(payload: any, secret: string) {
  return new Promise<string | undefined>((resolve, reject) => {
    jwt.sign(payload, secret, (err: any, token: string | undefined) => {
      if (err) return reject(err);
      resolve(token);
    });
  });
}

export async function asyncJWTverify(payload: string, secret: string) {
  return new Promise<string | jwt.JwtPayload | UserJwtReceived>(
    (resolve, reject) => {
      jwt.verify(payload, secret, (err, decoded) => {
        if (err || !decoded) return reject(err);
        resolve(decoded);
      });
    }
  );
}
