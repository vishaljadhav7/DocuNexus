import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../typesOverrides";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

 export default passport.use(
    new GoogleStrategy({
    clientID : process.env.CLIENT_ID!,
    clientSecret : process.env.CLIENT_SECRET!,
    callbackURL : "/auth/google/callback",
    scope : ["profile", "email"] 
    }, 
    async (accessToken, refreshToken, profile, done) => {
      
      let user : User | null;

      try {
        user = await prisma.user.findUnique({ 
            where : {googleId : profile.id}
        });

      } catch (error) {
         return done(error, false)
      }

      try {
        if(!user){
            prisma.user.create({
                data : {
                    googleId : profile.id,
                    userName : profile.username! ,
                    emailId : profile.emails![0].value,
                    isPremium : false,
                }
            })
        }

        return done(null, user as User)
      } catch (error) {
        return done(error, false)
      }
    })
)


passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser( async (userId : string, done) => {
    let user : User | null;
    
    try {
      user = await prisma.user.findUnique({ 
          where : {id : userId}
      });
      return user ? done(null, user) : done(null, null);
    } catch (error) {
       done(error, null) 
    }
})