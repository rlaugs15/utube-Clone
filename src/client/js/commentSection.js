const videoContainer = document.getElementById('videoContainer')
const form = document.getElementById('commentForm')
//댓글 목록을 동적으로 생성하고 있다면, 댓글 목록을 감싸는 부모요소를 선택하고 삭제 버튼 클릭 이벤트를 부모 요소에 위임해야 함
const commentsContainer = document.querySelector('.video__comments')
//const comment = document.querySelector('.video__comment')
const btnSpan = document.querySelector('.video__comment__button')
//const xBtn = btnSpan.querySelector('button');//btnSpan을 선택할 때, 첫 번째 .video__comment__button하여 문제발생
//이로 인해 여러 댓글이 있을 경우 첫 번째 댓글의 삭제 버튼만 선택되고, 다른 댓글의 삭제 버튼은 선택되지 않았다.
//동적인 

const removeButton = (event) => {//hlandleRemove이벤트리스너가 발동하여 서버에 삭제요청 보냄
    const btn = event.target.closest('button')
    if (!btn) {
        return
    }
    const liToRemove = btn.closest('.video__comment')
    if (liToRemove) {
        liToRemove.remove();
    }
}

//새로고침 후 나타나는 fetch로 보낸 댓글을, 페이지를 새로고침 시 함수가 초기화되는 것을 이용해 함수를 만들어 해결
const addComment = (text, id) => {
    const videoComments = document.querySelector('.video__comments ul')
    const newComment = document.createElement('li')
    newComment.dataset.id = id
    newComment.className = 'video__comment'
    const icon = document.createElement('i')
    icon.className = 'fas fa-comment'
    const span = document.createElement('span')
    span.innerText = `${text}`
    const span2 = document.createElement('span')
    const button = document.createElement('button')
    button.innerText = '❌'
    button.addEventListener('click', removeButton)
    newComment.appendChild(icon)
    newComment.appendChild(span)
    newComment.appendChild(span2)
    span2.appendChild(button)
    videoComments.prepend(newComment)
}

const handleSubmit = async (event) => {
    event.preventDefault()
    const textarea = form.querySelector('textarea')
    const text = textarea.value//사용자로부터 내용을 받고
    const { id } = videoContainer.dataset//어느 비디오에 있는지 알아야하므로
    if (text === '') {
        return
    }
    const response = await fetch(`/api/videos/${id}/comment`, {//text를 백엔드로 보냄. videoPlayer.js의 handleEnded함수 참고
        method: 'POST',
        headers: {//headers는 기본적으로 request에 추가할 수 있는 정보
            //application/json - 주로 클라이언트가 JSON 형식의 데이터를 서버로 전송할 때 사용
            'Content-Type': 'application/json'//string으로 전송되지만 본문에 있는 데이터가 JSON 형식임을 나타냄
        },
        body: JSON.stringify(//form에서 정보를 보내고 req.body 안에서 모든 input을 받는 것과 비슷
            { text },
        )
    })
    if (response.status === 201) {
        textarea.value = ''
        const { newCommentId } = await response.json()
        addComment(text, newCommentId)
    }
}

const hlandleRemove = async (event) => {
    try {
        const btn = event.target.closest('button')// 클릭된 요소가 버튼인지 확인하고(closest()-가장 가까운 조상 요소를 찾음, 이벤트 위임에 유용)
        if (!btn) {
            return
        }
        //.video__comment를 변수로 할당하지 않은 이유: 요소를 변수에 할당하는 것은 요소를 한 번만 선택할 때 유용
        const comment = btn.closest('.video__comment')//btn의 가장 가까운 '.video__comment' 요소를 찾는다.
        const { id } = comment.dataset
        const response = await fetch(`/api/videos/${id}/remove`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
        })

        if (response.ok) {//ok는 응답상태코드가 200~299이면 true를 반환
            console.log('댓글 삭제 성공');
        } else {
            console.log('댓글 삭제 실패');
        }
    } catch (error) {
        console.error('댓글 삭제 중 오류 발생: ', error);
    }
}

if (form) {
    form.addEventListener('submit', handleSubmit)
}
if (btnSpan) {
    commentsContainer.addEventListener('click', hlandleRemove)
    commentsContainer.addEventListener('click', removeButton)
}

