import "dotenv/config";

console.log("RAZORPAY_KEY_ID:", JSON.stringify(process.env.RAZORPAY_KEY_ID));
console.log("RAZORPAY_KEY_SECRET:", JSON.stringify(process.env.RAZORPAY_KEY_SECRET));
console.log("CURRENCY:", JSON.stringify(process.env.CURRENCY));
console.log("Keys in process.env:", Object.keys(process.env).filter(k => k.includes("RAZORPAY") || k.includes("CURRENCY")));
