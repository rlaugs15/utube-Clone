import mongoose from "mongoose";

mongoose.connect(process.env.DB_URL)


const db = mongoose.connection//db로의 connection이 열린다 = db에 연결된다

const handleError = (error) => console.log('❌DB Error', error)
const handleOpen = () => console.log('Connected to DB✅')

db.on('error', handleError);//db에 에러가 나면 이벤트가 발생하여 알려줄 것이다.
db.once('open', handleOpen);//db에 연결이 되면 알려줄 것이다.