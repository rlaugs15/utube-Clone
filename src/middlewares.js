import multer from "multer"

//이제 로그인 상태에 따른 화면변화를 구성할 수 있다.
export const localMiddleware = (req, res, next) => {
    res.locals.loggedIn = Boolean(req.session.loggedIn)
    res.locals.siteName = 'Utube'
    res.locals.loggedInUser = req.session.user || {}//프로퍼티 접근 시 에러를 방지하기 위해 {} 사용
    next()
}

//사용자가 로그인 돼 있지 않은 걸 확인하면, 로그인 페이지로 redirect
export const protectorMiddleware = (req, res, next) => {
    if (req.session.loggedIn) { //세션에 저장되면 어느 컨트롤러나 미들웨어에서 사용 가능
        next()
    } else {
        req.flash('error', 'Not authorized')
        return res.redirect('/login')
    }
}

//로그인 돼 있지 않은 사람들만 접근, 로그인 하고 로그인 페이지 가는 거 방지 등
export const publicOnlyMiddleware = (req, res, next) => {
    if (!req.session.loggedIn) {
        next()
    } else {
        req.flash('error', 'Not authorized')
        return res.redirect('/')
    }
}

export const avatarUpload = multer({
    dest: 'uploads/avatars/',
    limits: {
        fileSize: 3000000, //3바이트
    }
})

export const videoUpload = multer({
    dest: 'uploads/videos/',
    limits: {
        fileSize: 10000000,
    }
})