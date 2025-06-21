import passport from 'koa-passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

interface GoogleUser {
  googleId: string;
  email?: string;
  name: string;
}

passport.serializeUser((user: GoogleUser, done: (err: any, user?: any) => void) => {
  done(null, user);
});

passport.deserializeUser((obj: GoogleUser, done: (err: any, user?: any) => void) => {
  done(null, obj);
});


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      const user: GoogleUser = {
        googleId: profile.id,
        email: profile.emails?.[0].value,
        name: profile.displayName,
      };
      return done(null, user);
    }
  )
);

export default passport;
