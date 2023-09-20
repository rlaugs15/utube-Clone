
import Express from "express" //express 패키지를 import
import morgan from "morgan"
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter"
import videoRouter from "./routers/videoRouter"
import userRouter from "./routers/userRouter"
import apiRouter from "./routers/apiRouter";
import { localMiddleware } from "./middlewares";

const app = Express() //express 앱을 생성해줌, express를 사용하려면 먼저 앱을 만들어야함
const logger = morgan('dev')
app.use(logger)

app.set('view engine', 'pug')
app.set('views', process.cwd() + '/src/views')
app.use(Express.urlencoded({ extended: true }))// 요청의 본문(body)에 포함된 데이터를 파싱하고 JavaScript 객체로 변환
app.use(Express.json())//string을 받아서 json으로 변환해줌, 브라우저와 서버는 tring으로 만들어 버리기 때문에 매우 유용

app.use( //세션 미들웨어. 사이트로 들어오는 모두를 기억할 것(로그인 안 했어도), 브라우저에 쿠키 전송, 사용자의 세션을 관리하고 인증 정보를 유지하기 위해 사용
    session({
        secret: process.env.COOIKE_SCRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 2000000,
        },
        store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
    })
)

app.use(flash())//이제 req.flash함수를 사용할 수 있다.
app.use(localMiddleware)//로컬미들웨어는 세션미들웨어 다음에 와야한다!, 주로 로그인 폼의 데이터를 처리하고 사용자를 인증하는 데 사용
app.use('/uploads', Express.static('uploads'))//static files serving:폴더 전체를 부라우저에게 노출, 기본적으로 폴더들은 노출되지 않으므로.
app.use('/static', Express.static('assets'))//서버에게 assets폴더의 내용물을 /assets 주소를 통해 공개하라는 것
app.use('/', rootRouter)
app.use('/videos', videoRouter)
app.use('/users', userRouter)
app.use('/api', apiRouter)

export default app //init.js에 있는 app.listen에게 가져다주기 위해