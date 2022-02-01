import { Request, Response } from "express";
import { CreateMessageService } from "../services/CreateMessageService";

class CreateMessageController {
  async handle(request: Request, response: Response) {
    const service = new CreateMessageService();

    const { message } = request.body;
    const { user_id } = request;

    const result = await service.execute(message, user_id);

    return response.json(result);
  }
}
export { CreateMessageController };
