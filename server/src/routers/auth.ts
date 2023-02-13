import express from "express";
import passport from "passport";
import session from "express-session";
import cookieSession from "cookie-session";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github";
import prisma from "../prisma";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { asyncJWTsign } from "../misc/jwt";
import { UserJwtToSend } from "../../types/jwt";
import { downloadPFP } from "../misc";
import { userSchema } from "../zod/user";

// Express router config
const auth = express.Router();
auth.use(express.json());
auth.use(
  cookieSession({
    name: "session",
    secret: "test",
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true,
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
      callbackURL: `${process.env.NODE_APP_URL}/auth/google/callback`,
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
      // First add the user to DB...
      const createdUser = await prisma.user.create({
        data: {
          name: profile.displayName.substring(0, 20),
          handle: (profile._json.email as string)
            .split("@")[0]
            .substring(0, 15),
          authProvider: "GOOGLE",
          authProviderId: profile.id,
        },
      });

      // ...then download their profile picture from Google
      await downloadPFP(createdUser.id, profile._json.picture as string);

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
      callbackURL: `${process.env.NODE_APP_URL}/auth/github/callback`,
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

      // User logging in for the first time:
      // first, add new user to DB...
      const createdUser = await prisma.user.create({
        data: {
          name: profile.displayName.substring(0, 20),
          handle: (profile.username as string).substring(0, 15),
          authProvider: "GITHUB",
          authProviderId: profile.id,
        },
      });

      // then download their profile picture from GitHub
      const photos = profile.photos as { value: string }[];
      await downloadPFP(createdUser.id, photos[0].value);

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
  res.redirect(`${process.env.VITE_REACT_APP_URL}/app`);
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
    session: false,
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
    session: false,
  }),
  sendAuthJWT
);

// Logout route
auth.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect(`${process.env.VITE_REACT_APP_URL}`);
});

export default auth;
