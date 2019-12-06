const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const md5 = require('md5');

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
	type: {
		type: String,
        required: true
	},
    status: {
        type: String,
        required: true
    },
    group: {
        type: Array,
        required: true
    },
    tokens: [{
        // tokenExpire: {
        //     type: Boolean,
        //     required: true
        // },
        accessToken:{
            type: String,
            required: true
        },
        refreshToken:{
            type: String,
            required: true
        }
    }],
	created_At_: {
		type: Date,
		required: true
	},
    updated_At_: {
        type: Date,
        default: Date.now
    }
});

userSchema.statics.findByCredentials = async (email, password) => {
    // Search for a user by email and password.
    const user = await User.findOne({ email} )
    if (!user) {
        throw new Error({ error: 'Invalid login credentials' })
    }
    const hashedPassword = md5(password);
    const isPasswordMatch = (hashedPassword === user.password)
    if (!isPasswordMatch) {
        throw new Error({ error: 'Invalid login credentials' })
    }
    return user
}

let User = mongoose.model('User', userSchema, 'users');

module.exports = User;