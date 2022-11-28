import express from "express";
import passport from "passport";
import session from "express-session";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { userSchema } from "../zod/schemas";
import jwt from "jsonwebtoken";
import { asyncJWTsign } from "../misc/jwt";
import { UserJwtToSend } from "../../types/jwt";

// Prisma setup
const prisma = new PrismaClient();

// Express router config
const auth = express.Router();
auth.use(express.json());
auth.use(
  session({
    secret: "test",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);

auth.use(passport.initialize());
auth.use(passport.session());

// Google passport strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: "http://localhost:8080/auth/google/callback",
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      const foundUser = await prisma.user.findFirst({
        where: {
          authProvider: "GOOGLE",
          authProviderId: profile.id,
        },
      });

      // User found
      if (foundUser) return done(null, foundUser);

      // User logging in for the first time
      const createdUser = await prisma.user.create({
        data: {
          name: profile.displayName,
          handle: (profile._json.email as string).split("@")[0],
          authProvider: "GOOGLE",
          authProviderId: profile.id,
        },
      });

      return done(null, createdUser);
    }
  )
);

// Google passport strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      callbackURL: "http://localhost:8080/auth/github/callback",
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      const foundUser = await prisma.user.findFirst({
        where: {
          authProvider: "GITHUB",
          authProviderId: profile.id,
        },
      });

      // User found
      if (foundUser) return done(null, foundUser);

      // User logging in for the first time
      const createdUser = await prisma.user.create({
        data: {
          name: profile.displayName,
          handle: profile.username as string,
          authProvider: "GITHUB",
          authProviderId: profile.id,
        },
      });

      return done(null, createdUser);
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("Serializing user:", user);
  done(null, user);
});

passport.deserializeUser(async (id: string, done) => {
  const user = await prisma.user.findUnique({
    where: { id: id },
    select: {
      id: true,
      name: true,
      handle: true,
    },
  });

  done(null, user);
});

// Request/Response handler - sends JWT in cookie down to auth'd users
async function sendAuthJWT(req: express.Request, res: express.Response) {
  console.log("User info:", req.user);

  const user = req.user as z.infer<typeof userSchema>;
  const payload: UserJwtToSend = { id: user.id };

  const token = await asyncJWTsign(payload, process.env.JWT_SECRET as string);

  res.cookie("token", token, { httpOnly: true });
  res.redirect("http://localhost:5173/app");
}

// Google auth routes
auth.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

auth.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    failureMessage: true,
  }),
  sendAuthJWT
);

// GitHub auth routes
auth.get("/github", passport.authenticate("github"));

auth.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/login",
    failureMessage: true,
  }),
  sendAuthJWT
);

export default auth;
