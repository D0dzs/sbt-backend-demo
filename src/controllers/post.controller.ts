import { Request, Response } from "express";
import prisma from "../../lib/db";
import { userRole } from "../../lib/utils";
import DeletePostSchema from "../schemas/DeletePostSchema";
import PostSchema from "../schemas/PostSchema";
import UpdatePostSchema from "../schemas/UpdatePostSchema";

const generateSlugForPost = async (title: string): Promise<string> => {
  return encodeURI(title).toLowerCase();
};

const createPost = async (req: Request, res: Response): Promise<any> => {
  const body = req.body;
  const parsed = PostSchema.safeParse(body);
  const userId = (req as any).user.id;

  if (!parsed.success) {
    const errors = parsed.error.errors.map((error) => error.message);

    return res.status(400).json({ errors });
  }

  const { title, content, shortDesc } = parsed.data;
  const slug = await generateSlugForPost(title);

  try {
    const ctx = await prisma.post.create({
      data: {
        slug: slug,
        title: title,
        content: content,
        shortDesc: shortDesc,
        publishedById: userId,
      },
      select: {
        modifiedAt: true,
        slug: true,
        publishedAt: true,
      },
    });

    if (ctx) return res.status(200).json({ message: "Poszt sikeresen publikálva!" });
  } catch (error) {
    const target = (error as any).meta.target[0];
    if (target === "slug") {
      return res
        .status(400)
        .json({ message: "Ilyen poszt már létezik, kérjük, változtassa meg a címet valami másra!" });
    }
  }

  return res.status(500).json({ message: "Sikertelen poszt létrehozása!" });
};

const getPost = async (req: Request, res: Response): Promise<any> => {
  const { postId } = req.body;
  if (!postId) return res.status(400).json({ message: "Missing parameter" });

  const ctx = await prisma.post.findUnique({
    where: { id: postId },
    select: { title: true, content: true, shortDesc: true, publishedAt: true },
  });

  if (!ctx) return res.status(404).json({ message: "Ilyen poszt nem létezik!" });

  return res.status(200).json(ctx);
};

const getAllPost = async (_req: Request, res: Response): Promise<any> => {
  const posts = await prisma.post.findMany({
    select: {
      title: true,
      content: true,
      shortDesc: true,
      slug: true,
      bannerURL: true,
      publishedAt: true,
    },
  });

  return res.status(200).json(posts);
};

const updatePost = async (req: Request, res: Response): Promise<any> => {
  const user = (req as any).user;
  const role = await userRole(user);

  const body = req.body;
  const parsed = UpdatePostSchema.safeParse(body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid post data" });
  }

  const { postId, title, content, shortDesc } = parsed.data;
  const slug = await generateSlugForPost(title);

  if (role === "admin") {
    try {
      const ctx = await prisma.post.update({
        where: { id: postId },
        data: { title, slug, content, shortDesc, modifiedAt: new Date() },
      });

      if (!ctx) return res.status(404).json({ message: "Ilyen poszt nem létezik!" });
      return res.status(200).json({ message: "Poszt sikeresen frissítve!" });
    } catch (error) {
      return res.status(500).json({ message: "Sikertelen frissítés!" });
    }
  } else {
    try {
      const ctx = await prisma.post.update({
        where: { id: postId, publishedById: user.id },
        data: { title, slug, content, shortDesc, modifiedAt: new Date() },
      });

      if (!ctx) return res.status(404).json({ message: "Ilyen poszt nem létezik!" });
      return res.status(200).json({ message: "Poszt sikeresen frissítve!" });
    } catch (error) {
      return res.status(500).json({ message: "Sikertelen frissítés!" });
    }
  }
};

const deletePost = async (req: Request, res: Response): Promise<any> => {
  const user = (req as any).user;
  const role = await userRole(user);
  const body = req.body;

  const parsed = DeletePostSchema.safeParse(body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid post data" });

  const { postId } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx: any) => {
      const post = await tx.post.findUnique({
        where: {
          id: postId,
        },
        select: {
          id: true,
          publishedById: true,
        },
      });

      if (!post) return res.status(404).json({ message: "Poszt nem létezik!" });

      if (role === "writer" && post.publishedById !== user.id) {
        return res.status(403).json({ message: "Ehhez a poszt törléséhez nem vagy jogosult!" });
      }

      const deletedPost = await tx.post.delete({
        where: {
          id: postId,
          ...(role === "writer" && { publishedById: user.id }),
        },
      });

      if (!deletedPost) return res.status(404).json({ message: "Poszt nem található!" });

      return res.status(200).json({ message: "Poszt sikeresen törölve!" });
    });
  } catch (error) {
    return res.status(500).json({ message: "Poszt törlése sikertelen!" });
  }
};

export { createPost, deletePost, getAllPost, getPost, updatePost };
