import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxLength: 20 },//{ type: String }으로 적어도 무관
    fileUrl: { type: String, require: true },
    thumbUrl: { type: String, require: true },
    description: { type: String, required: true, trim: true, minLength: 2 }, //input에 숫자를 입력해도 문자로 변환해줌
    createdAt: { type: Date, required: true, default: Date.now }, //테이터 타입을 구체적으로 적을 수록 좋음
    hashtags: [{ type: String, trim: true }],
    meta: {
        views: { type: Number, default: 0, required: true },
        rating: { type: Number, default: 0, required: true },
    },
    owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
})

videoSchema.static('formatHashtags', function (hashtags) {
    return hashtags.split(',').map((word) => (word.startsWith('#') ? word : `#${word}`))
})

const Video = mongoose.model('Video', videoSchema)
export default Video