import { PrismaClient } from '@prisma/client';
import prisma from 'PrismaClient';

const {         
    getUser, 
    createUser,
    updateUser,
    deleteUser
} = require('../controllers');  


router.post("/register", createUser);

router.get("/getuser", getUser);

router.post("deleteUser", deleteUser);

router.post("updateUser", updateUser);

module.exports = router;