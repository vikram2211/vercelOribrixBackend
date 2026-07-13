import express from"express";
const router = express.Router()

router.get("/v1/display-kyc",  authenticate, authorize("SUPER_ADMIN"),displayAllKYC_Vender)

export default router;