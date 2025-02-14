import { Request, Response } from "express";
import prisma from "../../lib/db";
import { Post } from "../schemas/PostSchema";
import UpdatePostSchema from "../schemas/UpdatePostSchema";

const generateSlugForPost = async (title: string): Promise<string> => {
  return title.replaceAll(" ", "-").toLowerCase().trim();
};

const createPost = async (req: Request, res: Response): Promise<any> => {
  const body = req.body;
  const parsed = Post.safeParse(body);
  const userId = (req as any).user.id;

  if (!parsed.success) {
    if (!parsed.success) {
      const errors = parsed.error.errors.map((error) => error.message);

      return res.status(400).json({ errors });
    }
  }

  const { title, content, shortDesc } = body;
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
      return res.status(400).json({ message: "Slug already exists, please change the title to somehting else!" });
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
    },
  });

  return res.status(200).json(posts);
};

const updatePost = async (req: Request, res: Response): Promise<any> => {
  const user = await (req as any).user;
  console.log(user);

  const body = req.body;
  const parsedBody = UpdatePostSchema.safeParse(body);

  if (!parsedBody.success) {
    return res.status(400).json({ message: "Invalid post data" });
  }
  const { postId, title, content, shortDesc } = body;
  const slug = await generateSlugForPost(title);

  const ctx = await prisma.post.update({
    where: { id: postId },
    data: { title, slug, content, shortDesc, modifiedAt: new Date() },
  });

  if (!ctx) return res.status(404).json({ message: "No post found" });

  return res.status(200).json({ message: "Post updated successfully" });
};

export { createPost, getPost, getAllPost, updatePost };
