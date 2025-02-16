import { Router } from "express";
import multer from "multer";
import { uploadSponsor } from "../controllers/sponsor.controller";
import authWare from "../middlewares/authWare";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/sponsors/");
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${encodeURI(file.originalname)}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
const sponsorRouter = Router();

sponsorRouter.post("/upload", authWare, upload.single("sLogo"), uploadSponsor);
// sponsorRouter.delete("/delete", authWare, deleteSponsor);

export default sponsorRouter;
