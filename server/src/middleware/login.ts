import express from "express";
import jwt from "jsonwebtoken";
import { UserJwtReceived } from "../../types/jwt";
import { asyncJWTverify } from "../misc/jwt";

export interface RequestCookies {
  token?: string;
}

export async function isLoggedIn(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  // Fetch JWT from cookie...
  const cookies = req.cookies as RequestCookies;
  console.log(cookies);
  if (!cookies.token) return res.sendStatus(401);
  try {
    // ...verify JWT
    const decoded = (await asyncJWTverify(
      cookies.token,
      process.env.JWT_SECRET as string
    )) as UserJwtReceived;
    console.log(decoded);

    // check for JWT expiry
    const expiryTime = Number(process.env.JWT_EXPIRY);
    if (Math.round(Date.now() / 1000) - decoded.iat > expiryTime) {
      return res.sendStatus(403);
    }

    // trying to bind JWT to Request object
    // req.lmao = "lmao";
    // console.log(req.lmao);
    // req.currentUser = "lmao";
    next();
  } catch (error) {
    console.error("Auth middleware error!", error);
    return res.sendStatus(403);
  }
}

export function getCurrentUser(req: express.Request) {
  // NOTE: must only be used with protected routes
  const cookies = req.cookies as RequestCookies;
  if (!cookies.token) {
    throw new Error("This can only be used with proteced routes");
  }
  const decoded = jwt.decode(cookies.token) as UserJwtReceived;
  return decoded;
}
