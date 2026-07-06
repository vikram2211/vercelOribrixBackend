export const sendSMS = async (mobile, message) => {
    // This is a mock service for local development
    console.log(`\n--- MOCK SMS SERVICE ---`);
    console.log(`To: ${mobile}`);
    console.log(`Message: ${message}`);
    console.log(`------------------------\n`);
    return true;
};

export const sendOTP = async (mobile, otp) => {
    const message = `Your OriBrix verification code is: ${otp}. Valid for 10 minutes.`;
    return await sendSMS(mobile, message);
};
