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
    tokenExpire: {
        type: String,
        required: true,
        default: ' '
    },
    accessToken:{
        type: String,
        required: true,
        default: ' '
    },
    refreshToken:{
        type: String,
        required: true,
        default: ' '
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

let User = mongoose.model('User', userSchema, 'users');

module.exports = User;