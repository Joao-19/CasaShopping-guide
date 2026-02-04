import {
  Controller,
  Post,
  Headers,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from "@nestjs/swagger";
import axios from "axios";

@ApiTags("Deploy")
@Controller("deploy")
export class DeployController {
  @Post("trigger")
  @ApiOperation({ summary: "Trigger Watchtower update" })
  @ApiHeader({
    name: "Authorization",
    description: "Bearer <WATCHTOWER_TOKEN>",
    required: true,
  })
  @ApiResponse({ status: 200, description: "Update triggered successfully" })
  @ApiResponse({ status: 401, description: "Invalid token" })
  async triggerDeploy(@Headers("authorization") authHeader: string) {
    const token = process.env.REPO_PASS || process.env.DOCKERHUB_PASSWORD;
    if (!token) {
      throw new HttpException(
        "Configuration error: Token not set",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!authHeader || authHeader !== `Bearer ${token}`) {
      throw new UnauthorizedException("Invalid deployment token");
    }

    try {
      // Internal call to Watchtower HTTP API
      // Using the service name 'casashopping-watchtower' from docker-compose
      const watchtowerUrl = "http://casashopping-watchtower:8080/v1/update";

      // Pass the token in the header as required by Watchtower
      const response = await axios.post(
        watchtowerUrl,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return {
        message: "Deployment triggered successfully",
        data: response.data,
      };
    } catch (error) {
      console.error("Deploy trigger failed:", error);
      throw new HttpException(
        "Failed to trigger Watchtower",
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
