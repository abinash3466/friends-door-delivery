const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const User = require("../models/User");
const Worker = require("../models/Worker");
const Otp = require("../models/Otp");

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "friends_super_secret_jwt_key_123",
    {
      expiresIn: "30d",
    }
  );
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ===========================
   REGISTER
=========================== */

const registerUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      coordinates,
      vehicleNumber,
    } = req.body;

    const userExists = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User with this email or phone already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || "CUSTOMER",
      coordinates:
        coordinates || {
          latitude: 8.7061,
          longitude: 77.4578,
        },
    });

    let workerProfile = null;

    if (user.role === "WORKER") {
      if (!vehicleNumber) {
        await User.findByIdAndDelete(user._id);

        return res.status(400).json({
          success: false,
          message: "Vehicle number is required",
        });
      }

      workerProfile = await Worker.create({
        user: user._id,
        vehicleNumber,
        vehicleType: "BIKE",
        status: "OFFLINE",
        currentCoordinates:
          coordinates || {
            latitude: 8.7061,
            longitude: 77.4578,
          },
      });
    }

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        coordinates: user.coordinates,
      },
      worker: workerProfile,
    });
  } catch (error) {
    next(error);
  }
};

/* ===========================
   LOGIN
=========================== */

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated",
      });
    }

    let workerProfile = null;

    if (user.role === "WORKER") {
      workerProfile = await Worker.findOne({
        user: user._id,
      });
    }

    /* OWNER OTP LOGIN */

    if (user.role === "OWNER") {
      const otp = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      await Otp.deleteMany({
        email: user.email,
      });

      await Otp.create({
        email: user.email,
        otp,
        expiresAt: new Date(
          Date.now() + 5 * 60 * 1000
        ),
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Friends Owner Login OTP",
        text: `Your OTP is ${otp}`,
      });

      const maskedEmail = user.email.replace(
        /^(.{2}).+(.{2}@.+)$/,
        "$1******$2"
      );

      return res.json({
        success: true,
        ownerOtpRequired: true,
        email: maskedEmail,
      });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        coordinates: user.coordinates,
      },
      worker: workerProfile,
    });
  } catch (error) {
    next(error);
  }
};

/* ===========================
   VERIFY OWNER OTP
=========================== */

const verifyOwnerOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await Otp.findOne({
      email,
      otp,
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP Expired",
      });
    }

    const user = await User.findOne({ email });

    await Otp.deleteMany({ email });

    let workerProfile = null;

    if (user.role === "WORKER") {
      workerProfile = await Worker.findOne({
        user: user._id,
      });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        coordinates: user.coordinates,
      },
      worker: workerProfile,
    });
  } catch (error) {
    next(error);
  }
};

/* ===========================
   GET PROFILE
=========================== */

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    let workerProfile = null;

    if (user.role === "WORKER") {
      workerProfile = await Worker.findOne({
        user: user._id,
      });
    }

    res.json({
      success: true,
      user,
      worker: workerProfile,
    });
  } catch (error) {
    next(error);
  }
};

/* ===========================
   UPDATE LOCATION
=========================== */

const updateLocation = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;

    if (
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide both latitude and longitude",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          "coordinates.latitude": latitude,
          "coordinates.longitude": longitude,
        },
      },
      { new: true }
    );

    let workerProfile = null;

    if (user.role === "WORKER") {
      workerProfile = await Worker.findOneAndUpdate(
        { user: user._id },
        {
          $set: {
            "currentCoordinates.latitude": latitude,
            "currentCoordinates.longitude": longitude,
          },
        },
        { new: true }
      );
    }

    res.json({
      success: true,
      coordinates: user.coordinates,
      worker: workerProfile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyOwnerOtp,
  getMe,
  updateLocation,
};