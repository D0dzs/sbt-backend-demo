import express from 'express';
import {         
    getUser, 
    createUser,
    updateUser,
    deleteUser
} from require('../controllers');  

const app = express();

router.post("/register", createUser);

router.get("/getuser", getUser);

router.post("/deleteUser", deleteUser);

router.post("/updateUser", updateUser);

export default router;