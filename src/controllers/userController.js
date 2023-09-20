import User from "../models/User";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render('join', { pageTitle: 'Join' })

export const postJoin = async (req, res) => {
    const { name, username, email, password, password2, location } = req.body
    if (password !== password2) {//User를 create하기 전에 패스워드 체크
        return res.status(400).render('join', {
            pageTitle: 'Join',
            errorMessage: 'Password confirmation does not math.'
        })
    }
    const exists = await User.exists({ $or: [{ username }, { email }] })// {username}=username:req.body.username
    if (exists) {
        return res.status(400).render('join', {
            pageTitle: 'Join',
            errorMessage: 'This username/email is already taken'
        })
    }
    try {
        await User.create({
            email,
            username,
            password,
            password2,
            name,
            location,
        })
        return res.redirect('/login')
    } catch (error) {
        return res.status(400).render('join', {
            pageTitle: 'Join',
            errorMessage: error._message
        })
    }
}

export const getLogin = (req, res) => res.render('login', { pageTitle: 'Log In' })
export const postLogin = async (req, res) => {
    const { username, password } = req.body
    const pageTitle = 'login'
    const user = await User.findOne({ username, socialOnly: false })
    if (!user) {
        return res.status(400).render('login', {
            pageTitle,
            errorMessage: 'User with username entered does not exist.'
        })
    }//계정 체크
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
        return res.status(400).render('login', {
            pageTitle,
            errorMessage: 'Wrong password.'
        })
    } //비번 체크(패스워드가 해싱됐는데 어떻게 일치하는지 알 수 있는지 이해)
    req.session.loggedIn = true//세션에 loggedIn을 true로 추가
    req.session.user = user//세션에 db의 유저정보를 저장
    //브라우저마다 req.session이 다르기에 몇몇 정보를 req.session object에 덧붙이는 것이다. 세션이 오브젝트니까 원하는 것을 아무거나 추가할 수 있기 때문이다.
    return res.redirect('/')
}

export const startGithubLogin = (req, res) => {
    const baseUrl = 'https://github.com/login/oauth/authorize'
    const config = { //URL의 쿼리 문자열 부분
        client_id: process.env.GH_CLIENT,
        allow_signup: false,
        scope: 'read:user user:email'//반드시 공백으로 구분할 것. 모든 건 여기서 출발
    }
    const params = new URLSearchParams(config).toString()
    const finalUrl = `${baseUrl}?${params}`
    return res.redirect(finalUrl)
}
export const finishGithubLogin = async (req, res) => {
    const baseUrl = 'https://github.com/login/oauth/access_token'
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code,
    }
    const params = new URLSearchParams(config).toString()
    const finalUrl = `${baseUrl}?${params}`
    const tokenRequest = await (
        await fetch(finalUrl, { //노드js에는 fetch가 설치되어있지 않아 에러. npm에서 설치
            method: "POST",
            headers: { //서버에게 요청을 보낼 때 포함시킬 메타데이터
                Accept: "application/json" //이게 없으면 깃허브가 text로 응답할 것, application을 json 타입으로 받고 싶다는 뜻
            }
        })).json()
    if ('access_token' in tokenRequest) {
        const { access_token } = tokenRequest
        const apiURL = "https://api.github.com"
        const userData = await ( //user데이터
            await fetch(`${apiURL}/user`, {
                headers: {
                    Authorization: `token ${access_token}`,//scope에 적은 내용에 관해 허용, 일종의 허가된 요청서
                }
            })).json()
        const emailData = await ( //email데이터
            await fetch(`${apiURL}/user/emails`, {
                headers: {
                    Authorization: `token ${access_token}`,//emails데이터를 받기 위해 토큰을 보낸다.
                }
            })
        ).json()
        const emailObj = emailData.find(
            (email) => email.primary === true && email.verified === true
        )
        if (!emailObj) {
            return res.redirect('/login')//계정이 없으면 회원가입을 유도
        }
        let user = await User.findOne({ email: emailObj.email })//깃헙과 똑같은 email을 찾으면 로그인시켜보자
        //db의 이메일과 일치하는 이메일이 없을 경우 계정 생성 추가, 깃허브 데이터로만 만들어진 계정
        if (!user) {
            user = await User.create({
                avatarUrl: userData.avatar_url,
                name: userData.name ? userData.name : "Unknown",
                username: userData.username ? userData.username : "Unknown",
                email: emailObj.email,
                password: "",
                socialOnly: true, //해당 계정을 password로 로그인할 수 없고 오로지 소셜로그인으로만, !user는 이것이 ture일 경우에만 발동
                location: userData.location,
            })
        }
        req.session.loggedIn = true //로그인
        req.session.user = user //시키기
        //await req.session.save(); //GitHub 로그인 후 첫 리다이렉트에서 로그인 정보가 반영되지 않는 문제가 발생했을 경우#7.21이슈
        return res.redirect('/')
    } else {
        return res.redirect('/login')
    }
}

export const logout = (req, res) => {
    //req.session.destroy() //세션이 undefined일 때는 req.flash()를 사용할 수 없으므로 아래와 같이 변경
    req.session.user = null;
    res.locals.loggedInUser = req.session.user;
    req.session.loggedIn = false;
    req.flash('info', 'Good Bye')
    return res.redirect('/')
}
export const getEdit = (req, res) => {
    return res.render("users/edit-profile", { pageTitle: "Edit Profile" });
};
export const postEdit = async (req, res) => {
    const { session: { user: { _id, avatarUrl }, }, body: { name, email, username, location }, file } = req//세션에 현재 로그인 된 사용자의 정보가 있다.
    //이메일 또는 사용자 아이디 중복 여부 확인
    const existUser = await User.exists({
        $or: [{ email }, { username }],
        _id: { $ne: _id }// 검색에서 현재 사용자 제외
    });
    if (existUser) {
        // 중복 email/username 사용자에 대한 경고창
        return res.status(400).render('users/edit-profile', {
            pageTitle: 'edit',
            errorMessage: 'This username/email is already taken'
        })
    }
    const updatedUser = await User.findByIdAndUpdate(_id, {
        avatarUrl: file ? file.path : avatarUrl,//파일이 존재한다면(유저가 form으로 파일을 보낸다면) file.path를 쓰고, 존재하지 않는다면(유저가 input을 건드리지 않았다면) 기존 avatarURL을 유지
        name,
        email,
        username,
        location
    },
        { new: true }) //findByIdAndUpdate의 3번째 인자인 옵션인데 업데이트 된 데이터를 return, 세션은 로그인 할 때 한 번만 작성되므로 최신버전을 업뎃해주자.
    req.session.user = updatedUser //const로 정보를 담아서 세션에 보내주면 편리하다
    return res.redirect("/users/edit");
};
export const getChagePassword = (req, res) => {
    /*if (req.session.user.socialOnly === true) { 깃허브 유저 돌려보내기 방법1, 템플릿에서 버튼을 숨기기로 했다
        return res.redirect('/')
    }*/
    return res.render("users/change-password", { pageTitle: "Change Password" })
}
export const postChagePassword = async (req, res) => {
    const { session: { user: { _id }, }, body: { oldPassword,
        newPassword,
        newPasswordConfirmation } } = req
    const user = await User.findById(_id)//세션과 db의 id를 각각 조회해서 동시업뎃
    const ok = await bcrypt.compare(oldPassword, user.password) //기존 비번이 정확한지 확인
    if (!ok) {
        return res.status(400).render("users/change-password", {
            pageTitle: "Change Password", errorMessage: "The existing password does not match."
        })
    }
    if (oldPassword === newPassword) {
        return res.status(400).render('users/change-password', {
            pageTitle,
            errorMessage: 'The old password equals new password',
        });
    }
    if (newPassword !== newPasswordConfirmation) {
        return res.status(400).render("users/change-password", {
            pageTitle: "Change Password", errorMessage: "Password does not match."
        })
    }
    user.password = newPassword
    await user.save()//새로운 비번을 해시하기 위해 User.js에 잇는 해시 발동
    req.flash('info', 'password updated')
    return res.redirect('/users/logout')
}
export const see = async (req, res) => {
    const { id } = req.params
    const user = await User.findById(id).populate({
        path: "videos",
        populate: {
            path: "owner",
            model: "User",
        },
    });
    if (!user) {
        return res.status(404).render('404', { pageTitle: 'User not found' })
    }
    return res.render('users/profile', { pageTitle: `${user.name} Profile`, user })
}
