import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    avatarUrl: String,
    socialOnly: { type: Boolean, default: false },
    username: { type: String, required: true, unique: true },
    password: { type: String },
    name: { type: String, required: true },
    location: String,
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
})

userSchema.pre('save', async function () {
    if (this.isModified('password')) {//특정 필드가 수정되었는지 여부를 확인하는 데 사용되는 메서드
        this.password = await bcrypt.hash(this.password, 5)
    }
})//여기서 this는 create되는 위의 user를 가리킨다.(email,username,..)

const User = mongoose.model('User', userSchema)
export default User