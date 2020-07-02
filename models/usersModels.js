const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, 'a user should have a name '],
  },
  email: {
    type: String,
    require: [true, 'please your email address'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, ' please provide a valide email address '],
  },
  photo: { type: String, default: 'default.jpg' },
  password: {
    type: String,
    require: [true, 'please provide a valide password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    require: [true, 'please confirm youyr password'],
    validate: {
      //THIS ONLY WORS ON CREATE OR SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'password are not the same',
    },
  },
  PasswordChangedAt: Date,
  PasswordResetToken: String,
  PasswordResetExpire: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
});

//THIS IS USED TO CRYPTE THE PASSWORD BEFORE SSAVE IT INTO THJE DATA BASE
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.PasswordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({
    active: {
      $ne: false,
    },
  });
  next();
});

// THIS METHOD IS USED TO COMPARED THE TWO PASSWORD BEFOR GIVE ACCESS TO THE USER
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// THIS METHOSD CHECK IF THE USER HAVE CHANGED THE PASSWORD AFTER HE CREATED THE ACCOUNT
userSchema.methods.passwordChangedAfter = function (JWTTimesstamp) {
  if (this.PasswordChangedAt) {
    const changedTimestamp = parseInt(
      this.PasswordChangedAt.getTime() / 1000,
      10
    );
    return changedTimestamp > JWTTimesstamp;
  }
  return false;
};
userSchema.methods.createPasswordTokenRset = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.PasswordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log(
    {
      resetToken,
    },
    this.PasswordResetToken
  );
  this.PasswordResetExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const Users = mongoose.model('User', userSchema);

module.exports = Users;
