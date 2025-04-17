import crypto from "crypto";

function generateRandomString(length = 6) {
    return crypto.randomBytes(length).toString("base64").substring(0,length);
}
export default generateRandomString;