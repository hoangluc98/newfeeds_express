const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');

let userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique:true,
        trim: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid!')
            }
        }
	},
	password: {
		type: String,
		required: true,
		trim:true,
        minlength: 7,
        validate(value){
            if(validator.isEmpty(value)){
                throw new Error('Please enter your password!')
            }else if(validator.equals(value.toLowerCase(),"password")){
                throw new Error('Password is invalid!')
            }else if(validator.contains(value.toLowerCase(), "password")){
                throw new Error('Password should not contain password!')
            }
        }
	},
	name: {
		type: String,
		trim: true,
		required: true
	},
	accountType: {
		type: String,
		required: true
	},
    token:{
        type:String,
        required: true
    },
	created_At_: {
		type: Date,
		required: true
	},
    updated_At_: {
        type: Date,
        default: Date.now
    }
});


userSchema.methods.newAuthToken = async function(){
    let user  = this;
    const token =  jwt.sign({ _id: user._id.toString() },'thisismynewblog', {expiresIn: "7 days"});
    user.token = token;
    await user.save();
    return token;
}

let User = mongoose.model('User', userSchema, 'users');

module.exports = User;