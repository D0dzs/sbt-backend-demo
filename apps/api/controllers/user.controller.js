import express from 'express';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const app = express();

const createUser = async (req, res) => {};

const updateUser = async (req, res) => {};

const getUser = async (req, res) => {};

const deleteUser = async (req, res) => {};

module.exports = {
  updateUser,
  createUser,
  getUser,
  deleteUser,
};
