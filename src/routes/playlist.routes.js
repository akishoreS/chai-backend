import {Router} from "express";
import{
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    updatePlaylist,
    getPalylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
} from "../controllers/playlist.controller.js"

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.use(verifyJWT)

router.route("/").post(createPlaylist)

router.route("/:playlistId").get(getPalylistById)
router.route("/:playlistId").patch(updatePlaylist)
router.route("/:playlistId").delete(deletePlaylist)

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist)
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist)

router.route("/user/:userId").get(getUserPlaylists)

export default router

