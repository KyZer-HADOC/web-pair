// test-mega.js
import * as mega from "megajs";

const storage = new mega.Storage({
  email: process.env.MEGA_EMAIL,
  password: process.env.MEGA_PASSWORD,
}, (err) => {
  if (err) {
    console.error("Login failed:", err);
  } else {
    console.log("✅ Login succeeded, space used:", storage.spaceUsed);
  }
});
