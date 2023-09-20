import Express from "express"
import { watch, getEidt, postEidt, getUpload, postUpload, deleteVideo } from "../controllers/videoController"
import { protectorMiddleware, videoUpload } from "../middlewares"


const videoRouter = Express.Router()

videoRouter.route('/upload').all(protectorMiddleware).get(getUpload).post(videoUpload.fields([{ name: "video", maxCount: 1 }, { name: 'thumb', maxCount: 1 }]), postUpload)
videoRouter.get('/:id([0-9a-f]{24})', watch) //모든 16진수 값을 찾아서 24자와 매치시킨다.(몽고db가 만들어낸 id 포맷에 맞춤)
videoRouter.route('/:id([0-9a-f]{24})/edit').all(protectorMiddleware).get(getEidt).post(postEidt)
videoRouter.route('/:id([0-9a-f]{24})/delete').all(protectorMiddleware).get(deleteVideo)

export default videoRouter