import User from "../models/User"
import Comment from "../models/Comment";
import Video from "../models/Video"

export const home = async (req, res) => {
    const videos = await Video.find({})
        .sort({ createdAt: "desc" })
        .populate("owner");
    return res.render('home', { pageTitle: 'Home', videos })
}


export const watch = async (req, res) => {
    const { id } = req.params // const id=req.params.id와 같다. 객체의 속성을 추출하여 변수로 할당
    //동영상 문서와 관련된 정보를 모두 가져와서 사용자 정보와 댓글 정보를 포함한 완전한 동영상 객체를 생성
    //전화번호부(스키마)에 저장만 된 owner와 comments를 populate()로 통화해서 현재 정보를 알아낸다고 생각하자.
    const video = await Video.findById(id).populate('owner').populate('comments').exec()//쿼리가 이미 있기때문에 exec() 없어도 됨.
    if (!video) { //video===null도 가능, 에러가 날 경우를 if로 먼저 처리하는게 좋을 것 같다.
        return res.render('404', { pageTitle: 'Video not found.' })
    }
    return res.render('videos/watch', { pageTitle: video.title, video }) //watch 템플릿에 video object 생성
}

export const getEidt = async (req, res) => { //화면에 보여줌
    const { id } = req.params
    const { user: { _id } } = req.session
    const video = await Video.findById(id)
    if (!video) { //video===null도 가능, 에러가 날 경우를 if로 먼저 처리하는게 좋을 것 같다.
        return res.status(404).render('404', { pageTitle: 'Video not found.' })
    }
    if (String(video.owner) !== String(_id)) {//접근자가 비디오 오너가 아닐 경우 홈 화면으로, js는 모양뿐 아니라 타입까지 같아야함
        return res.status(403).redirect('/')
    }
    return res.render('videos/edit', { pageTitle: `Edit: ${video.title}`, video })
}
export const postEidt = async (req, res) => { // 변경사항을 저장
    const { user: { _id } } = req.session
    const { id } = req.params
    const { title, description, hashtags } = req.body
    const video = await Video.exists({ _id: id })//Video 컬렉션의 _id필드와 req.params의 id가 같은 경우를 찾는다.
    if (!video) { //video===null도 가능, 에러가 날 경우를 if로 먼저 처리하는게 좋을 것 같다.
        return res.render('404', { pageTitle: 'Video not found.' })
    }
    if (String(video.owner) !== String(_id)) {//접근자가 비디오 오너가 아닐 경우 홈 화면으로, js는 모양뿐 아니라 타입까지 같아야함
        return res.status(403).redirect('/')
    }
    await Video.findByIdAndUpdate(id, {
        title,
        description,
        hashtags: Video.formatHashtags(hashtags),
    })
    req.flash('sucess', 'Changes saved')
    return res.redirect(`/videos/${id}`)
}

export const getUpload = (req, res) => {
    return res.render('videos/upload', { pageTitle: 'Video Upload' })
}

export const postUpload = async (req, res) => {
    const { user: { _id }, } = req.session
    const { video, thumb } = req.files;
    const { title, description, hashtags } = req.body
    try {
        const newVideo = await Video.create({ //비디오 오브젝트
            title, //title:title과 같다. 왼쪽은 스키마의 것이고, 오른쪽은 request.body 안의 것
            description,
            fileUrl: video[0].path,
            thumbUrl: thumb[0].path.replace(/[\\]/g, "/"),// 윈도우 환경에서는 url에 \\를 사용할수 없어서 바꿔주었다.
            fileUrl: file.path, //multer는 req.file을 제공해주는데 file 안에는 path가 있다. 꼭 기억하자
            owner: _id,
            hashtags: Video.formatHashtags(hashtags),
        })
        const user = await User.findById(_id)
        user.videos.push(newVideo._id)
        user.save()//변경된 데이터가 메모리상의 사용자 객체에만 적용되고, 실제 데이터베이스에는 아직 반영되지 않았기 때문
        return res.redirect('/')
    } catch (error) {
        return res.status(400).render('videos/upload', {
            pageTitle: 'Video Upload',
            errorMessage: error._message //upload를 render할 때 에러 메세지도 함께 render(upload.pug에 if로 표시 )
        })
    }
}


export const deleteVideo = async (req, res) => {
    const { id } = req.params
    const { user: { _id } } = req.session
    const video = await Video.findById(id)
    if (!video) {
        return res.render('404', { pageTitle: 'Video not found.' })
    }
    if (String(video.owner) !== String(_id)) {//접근자가 비디오 오너가 아닐 경우 홈 화면으로, js는 모양뿐 아니라 타입까지 같아야함
        req.flash('error', 'Not authorized')
        return res.status(403).redirect('/')
    }
    await Video.findByIdAndDelete(id)
    /*user.videos.splice(user.videos.indexOf(id),1); User db에 남은 video도 삭제
    user.save();*/
    return res.redirect('/')
}
/*'DELETE' 방식이 아닌 'GET' 방식을 사용한 이유:
사용자가 해당 URL을 방문할 때 비디오를 삭제하고 싶기 때문이고 브라우저에서 전송하는
것은 GET이 전부이기에.
DELETE를 보내려면 JS를 사용하여 해당 방법으로 요청을 보내거나 양식을 만들 수 있으며 
양식에 DELETE 방법을 사용하도록 하면 버튼에서 양식을 제출하면 됨*/

export const search = async (req, res) => {
    const { keyword } = req.query
    let videos = []
    if (keyword) { //keyword가 존재할 때
        videos = await Video.find({
            title: {
                $regex: new RegExp(keyword, 'i') //정규식, 제목에 keyword를 포함하는 영상을 찾는다.
            }
        }).populate("owner");
    }
    return res.render('search', { pageTitle: 'Search', videos })
}

export const registerView = async (req, res) => {
    const { id } = req.params
    const video = await Video.findById(id)
    if (!video) {
        return res.sendStatus(404)
    }
    video.meta.views += 1
    await video.save()
    return res.sendStatus(200)//이렇게 해야 연결을 끝낼 수 있다. 상태코드를 보내고 연결을 끝냄
}

export const createComment = async (req, res) => {
    const {
        session: { user },//백엔드로 오는 모든 request는 쿠키와 함께 와서 세션으로 활용
        body: { text },
        params: { id }
    } = req

    const video = await Video.findById(id)
    if (!video) {
        return res.sendStatus(404)
    }
    const comment = await Comment.create({
        text,
        owner: user._id,
        videos: id
    })
    //몽고db에서 스키마 간의 관계를 설정하는 것은 두 스키마 간의 "연결"을 만드는 것만을 의미, 
    //한 스키마의 변경 사항이 다른 스키마로 자동으로 전파되지 않는다.
    video.comments.push(comment._id)//관계형 데이터베이스와 달리 관계를 나타내지 않는 대신 참조를 사용하여 관계를 유지하므로 필요한 작업
    video.save()//비디오스키마에 comment의 변경사항을 알려준다, 아래 방법에 비해 가볍지만 일관성 보장 어렵거나 최적화에 제약 생길수도/성능을 최적화하고 서버 부하를 줄이려면
    //await video.populate('comments').execPopulate()//두 줄의 save작업 말고 이것으로도 처리 가능, 대량의 데이터의 경우 서버에 부하 의심/일관성과 데이터 정확성이 중요한 경우
    return res.status(201).json({ newCommentId: comment._id });//id는 가짜댓글에 사용하기 위해
    //sendStatus 에러: 응답 상태 코드를 설정하고 해당 코드에 맞는 상태 메시지를 자동으로 전송하는 메서드
    //따라서 이 메서드를 호출한 후에는 다른 응답 메서드를 호출해서는 안 되므로 코멘트 id 전송 못 함
}

export const createRemove = async (req, res) => {
    try {
        const {
            session: { user },//백엔드로 오는 모든 request는 쿠키와 함께 와서 세션으로 활용
            params: { id }
        } = req
        const comment = await Comment.findById(id).populate('owner')
        const ownerIdString = comment.owner._id.toString();
        if (user._id !== ownerIdString) {
            return res.sendStatus(403)
        }
        await Comment.findByIdAndRemove(id)
        //await Comment.findByIdAndUpdate(id, { $pull: comment });
        //$pull은 일반적으로 배열 필드에서 특정 요소를 제거하는 데 사용. 대상 필드가 배열이여야 한다. 따라서 객제를 제거하는 것은 올바르지 않음

        return res.sendStatus(201)
    } catch (error) {
        console.error('댓글 삭제 중 오류 발생: ', error);
        return res.status(500).json({ message: '댓글 삭제 실패' });
    }
}