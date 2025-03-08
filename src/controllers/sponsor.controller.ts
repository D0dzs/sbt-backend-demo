import { Request, Response } from "express";
import fs from "fs";
import { validateMIMEType } from "validate-image-type";
import prisma, { getCategoryByName } from "../../lib/db";
import { userRole } from "../../lib/utils";
import DeleteSponsorSchema from "../schemas/DeleteSponsorSchema";
import SponsorGroupSchema from "../schemas/SponsorGroupSchema";
import SponsorSchema from "../schemas/SponsorSchema";
import path from "path";

const uploadSponsor = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.file) return res.status(400).json({ message: "Nincs feltöltött kép!" });

    const body = req.body;
    const parsed = SponsorSchema.safeParse(body);
    if (!parsed.success) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ errors: parsed.error.errors.map((error) => error.message) });
    }

    const { sName, sCategory, sWebUrl } = parsed.data;
    const categoryId = await getCategoryByName(sCategory);

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/svg+xml", "image/webp"];
    const filePath = req.file.path;
    const result = await validateMIMEType(filePath, { allowMimeTypes: allowedMimeTypes });

    if (!result.ok) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: "Hibás fájl típus!" });
    }

    const filename = path.basename(filePath);
    const relativePath = `s/${filename}`;

    const ctx = await prisma.sponsor.create({
      data: {
        name: sName,
        logoUrl: relativePath,
        websiteUrl: sWebUrl,
        sponsorGroupID: categoryId,
      },
    });

    if (!ctx) {
      fs.unlinkSync(filePath);
      return res.status(500).json({ message: "Szponzor létrehozása sikertelen!" });
    }

    return res.status(200).json({ message: "Szponzor feltöltve sikeresen!" });
  } catch (error) {
    res.status(500).json({ message: "Sikertelen szponzor feltöltés!" });
  }
};

const getSponsors = async (_req: Request, res: Response) => {
  try {
    const sponsors = await prisma.sponsor.findMany({ omit: { id: true } });
    res.status(200).json(sponsors);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const createSponsorGroup = async (req: Request, res: Response): Promise<any> => {
  const user = (req as any).user;
  const role = await userRole(user);
  if (role !== "admin") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const body = req.body;
    const parsed = SponsorGroupSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.errors.map((error) => error.message);
      return res.status(400).json({ errors });
    }

    const { name } = parsed.data;
    const ctx = await prisma.sponsorGroup.create({
      data: {
        name,
      },
    });

    if (!ctx) return res.status(500).json({ message: "Szponzor csoport létrehozása sikertelen!" });

    return res.status(200).json({ message: "Szponzor csoport létrehozva sikeresen!" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteSponsor = async (req: Request, res: Response): Promise<any> => {
  const user = (req as any).user;
  const role = await userRole(user);
  if (role !== "admin") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const body = req.body;
    const parsed = DeleteSponsorSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.errors.map((error) => error.message);
      return res.status(400).json({ errors });
    }

    const { id } = parsed.data;
    const ctx = await prisma.sponsorGroup.delete({
      where: { id },
    });

    if (!ctx) return res.status(500).json({ message: "Szponzor törlése sikertelen!" });

    return res.status(200).json({ message: "Szponzor sikeresen törölve!" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { createSponsorGroup, deleteSponsor, getSponsors, uploadSponsor };
