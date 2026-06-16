const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendVerificationEmail } = require("../utils/emailService");

const createToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN;
  return jwt.sign({ id: userId }, secret, { expiresIn });
};

const buildVerificationToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  return {
    rawToken,
    hashedToken,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };
};

const isBcryptHash = (value) =>
  typeof value === "string" && /^\$2[aby]\$\d{2}\$/.test(value);

const verifyAndUpgradePassword = async (user, password) => {
  const storedPassword = String(user.password || "");

  if (isBcryptHash(storedPassword)) {
    return bcrypt.compare(password, storedPassword);
  }

  // Support legacy plaintext passwords and upgrade them after a successful login.
  if (storedPassword && storedPassword === password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    return true;
  }

  return false;
};

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        message: existingUser.isVerified
          ? "User already exists"
          : "Account already exists but email is not verified. Please verify or request a new verification email.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verification = buildVerificationToken();

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      isVerified: false,
      verificationToken: verification.hashedToken,
      verificationTokenExpires: verification.expiresAt,
    });

    await sendVerificationEmail({
      email: user.email,
      name: user.name,
      token: verification.rawToken,
    });

    return res.status(201).json({
      message:
        "Verification email sent. Please verify your Gmail before login.",
      requiresVerification: true,
      email: user.email,
    });
  } catch (err) {
    return next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await verifyAndUpgradePassword(user, password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
        requiresVerification: true,
        email: user.email,
      });
    }

    const token = createToken(user._id);

    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    return next(err);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const token = req.query.token || req.body.token;
    if (!token) {
      return res.status(400).send("Verification token missing");
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res
        .status(400)
        .send("Verification link is invalid or has expired.");
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    return res.send(
      "<h2>Email verified successfully.</h2><p>You can now go back and log in to NextStep AI.</p>",
    );
  } catch (err) {
    return next(err);
  }
};

const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    const verification = buildVerificationToken();
    user.verificationToken = verification.hashedToken;
    user.verificationTokenExpires = verification.expiresAt;
    await user.save();

    sendVerificationEmail({
      email: user.email,
      name: user.name,
      token: verification.rawToken,
    }).catch((e) => console.error("Failed to resend verification email:", e));

    return res.json({ message: "Verification email sent again" });
  } catch (err) {
    return next(err);
  }
};

const getUser = async (req, res, next) => {
  try {
    return res.json({ user: req.user });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
  getUser,
};
