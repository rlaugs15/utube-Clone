import 'dotenv/config'
import "./db"
import "./models/Video"
import "./models/User"
import app from "./server"


const PORT = 4000 //보통 높은 번호일 수록 비어있음

app.listen(PORT, () => console.log(`server listening on port http://localhost:${PORT}`))
// app.listen - 서버가 요청을 받을 때까지 대기하게 함