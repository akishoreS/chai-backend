import {Router} from "express";
import { createTweet,getUserTweet,updateTweet,deleteTweet } from "../controllers/tweet.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router= Router();
router.use(verifyJWT);

router.route("/createTweet").post(createTweet);//tested
router.route("/user/:userId").get(getUserTweet);//tested
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);//tested

export default router
