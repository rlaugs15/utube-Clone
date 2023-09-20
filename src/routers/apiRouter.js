import Express from "express";
import { registerView, createComment, createRemove } from "../controllers/videoController"

const apiRouter = Express.Router()

apiRouter.post("/videos/:id([0-9a-f]{24})/view", registerView);
apiRouter.post("/videos/:id([0-9a-f]{24})/comment", createComment);
apiRouter.delete("/videos/:id([0-9a-f]{24})/remove", createRemove);

export default apiRouter