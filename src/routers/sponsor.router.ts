import { Router } from "express";
import multer from "multer";
import { generateUID } from "../../lib/utils";
import { createSponsorGroup, deleteSponsor, uploadSponsor } from "../controllers/sponsor.controller";
import authWare from "../middlewares/authWare";
import path from "path";

const destinationDir = path.join(__dirname, "..", "..", "images", "s");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, destinationDir);
  },
  filename: async (_req, file, cb) => {
    const customID = await generateUID();
    const fileExtension = path.extname(file.originalname);
    const finalName = `${customID}${fileExtension}`;
    cb(null, finalName);
  },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
const sponsorRouter = Router();

sponsorRouter.post("/create-group", authWare, createSponsorGroup);
sponsorRouter.post("/upload", authWare, upload.single("sLogo"), uploadSponsor);
sponsorRouter.delete("/delete-group", authWare, deleteSponsor);

export default sponsorRouter;
