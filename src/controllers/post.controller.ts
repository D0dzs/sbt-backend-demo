import { Request, Response } from "express";
import prisma from "../../lib/db";
import { userRole } from "../../lib/utils";
import PostSchema from "../schemas/PostSchema";
import UpdatePostSchema from "../schemas/UpdatePostSchema";
import DeletePostSchema from "../schemas/DeletePostSchema";

const generateSlugForPost = async (title: string): Promise<string> => {
  return encodeURI(title);
};

const createPost = async (req: Request, res: Response): Promise<any> => {
  const body = req.body;
  const parsed = PostSchema.safeParse(body);
  const userId = (req as any).user.id;

  // if (!parsed.success) {
  if (!parsed.success) {
    const errors = parsed.error.errors.map((error) => error.message);

    return res.status(400).json({ errors });
  }
  // }

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

    if (ctx) return res.status(200).json({ message: "Post created successfully" });
  } catch (error) {
    const target = (error as any).meta.target[0];
    if (target === "slug") {
      return res.status(400).json({ message: "Slug already exists, please change the title to something else!" });
    }
  }

  return res.status(500).json({ message: "Failed to create post" });
};

const getPost = async (req: Request, res: Response): Promise<any> => {
  const { postId } = req.body;
  if (!postId) return res.status(400).json({ message: "Missing parameter" });

  const ctx = await prisma.post.findUnique({
    where: { id: postId },
    select: { title: true, content: true, shortDesc: true, publishedAt: true },
  });

  if (!ctx) return res.status(404).json({ message: "No post found" });

  return res.status(200).json(ctx);
};

const getAllPost = async (req: Request, res: Response): Promise<any> => {
  const posts = await prisma.post.findMany({
    select: {
      title: true,
      content: true,
      shortDesc: true,
      slug: true,
      bannerURL: true,
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
    const ctx = await prisma.post.update({
      where: { id: postId },
      data: { title, slug, content, shortDesc, modifiedAt: new Date() },
    });

    if (!ctx) return res.status(404).json({ message: "No post found" });
    return res.status(200).json({ message: "Post updated successfully" });
  } else {
    const ctx = await prisma.post.update({
      where: { id: postId, publishedById: user.id },
      data: { title, slug, content, shortDesc, modifiedAt: new Date() },
    });

    if (!ctx) return res.status(404).json({ message: "No post found" });
    return res.status(200).json({ message: "Post updated successfully" });
  }
};

const deletePost = async (req: Request, res: Response): Promise<any> => {
  const user = (req as any).user;
  const role = await userRole(user);

  const body = req.body;
  const parsed = DeletePostSchema.safeParse(body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid post data" });
  }

  const { postId } = parsed.data;
  if (role === "admin") {
    const ctx = await prisma.post.delete({
      where: { id: postId },
    });

    if (!ctx) return res.status(404).json({ message: "No post found" });

    return res.status(200).json({ message: "Post deleted successfully" });
  }

  const ctx = await prisma.post.delete({
    where: { id: postId, publishedById: user.id },
  });

  if (!ctx) return res.status(404).json({ message: "No post found or user is not authorized to delete this post!" });

  return res.status(200).json({ message: "Post deleted successfully" });
};

export { createPost, getPost, getAllPost, updatePost, deletePost };
