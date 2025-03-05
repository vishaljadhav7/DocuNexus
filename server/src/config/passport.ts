import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Profile , } from "passport";
import { PrismaClient , User} from "@prisma/client";
import { VerifyCallback } from "passport-google-oauth20";
    
const prisma = new PrismaClient();

 export default passport.use(
    new GoogleStrategy({
    clientID : process.env.CLIENT_ID!,
    clientSecret : process.env.CLIENT_SECRET!,
    callbackURL : process.env.CALLBACK_URL,
    scope : ["profile", "email"],
    passReqToCallback: true 
    }, 
    async ( req ,accessToken, refreshToken, profile :  Profile, done : VerifyCallback) => {
      let user : User | null;
      if(!profile) throw new Error("Profile not found");

      try {
        user = await prisma.user.findUnique({ 
            where : {googleId : profile.id}
        });
        
        if(!user){
        user = await prisma.user.create({
              data : {
                  googleId : profile.id,
                  userName : profile.displayName! ,
                  emailId : profile.emails![0].value,
                  isPremium : false,
              }
          })
        }
  
       done(null, user as User)
      } catch (error) {
          done(error, false)
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