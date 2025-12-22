import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "default_secret",
    });
    console.log(
      "JwtStrategy Initialized. Secret defined:",
      !!process.env.JWT_SECRET
    );
  }

  async validate(payload: any) {
    console.log("JwtStrategy Validating payload:", payload);
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
