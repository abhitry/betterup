import jwt from "jsonwebtoken";
require("dotenv").config();
import express from "express"
import cors from "cors";
const app = express();
import { prismaClient } from "store/client";
import { AuthInput } from "./types";
import { authmiddleware } from "./middleware";
app.use(express.json());
app.use(cors());

app.post("/website",authmiddleware, async (req, res) => {
    if (!req.body.url) {
        res.status(411).json({});
        return
    }
    const website = await prismaClient.website.create({
        data: {
            url: req.body.url,
            timeAdded: new Date(),
            userId:req.userId!
        }
    })

    res.json({
        id: website.id,
        url:website.url,
        userId:website.userId,
        timeAdded:website.timeAdded
    })
});

app.get("/status/:websiteId", authmiddleware,async(req, res) => {
    const website = await prismaClient.website.findFirst({
      where: {
        id: req.params.websiteId!,
        userId: req.userId!  // Assuming you’re checking for the authenticated user's websites
      },
      include: {
        ticks: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    });
   if(!website)
   {
        res.status(409).json({
            message:"Not Found"
        })
        return;
   }
   res.json({
        url:website.url,
        id:website.id,
        userId:website.userId,
        ticks: website.ticks
   })
})

app.post("/user/signup", async(req, res) => {
    const data=AuthInput.safeParse(req.body);
    if(!data.success)
    {
        res.status(403).send("");
        return;
    }
    try{
        let user=await prismaClient.user.create({
            data: {
                username: data.data.username,
                password: data.data.password
            }
        })
        res.json({
            id:user.id
        })
    }
    catch(e)
    {
        res.status(403).send({
            message:"same username "
        })
    }
})

app.post("/user/signin", async(req, res) => {
    const data=AuthInput.safeParse(req.body);
    if(!data.success)
    {
        res.status(403).send("");
        return;
    }
    let user=await prismaClient.user.findFirst({
        where:{
            username:data.data.username
        }
    })
    if(user?.password!=data.data.password)
    {
        res.status(403).send("password invalid");
        return;
    }
    let token=jwt.sign({
        sub:user.id
    },process.env.JWT_SECRET!)

    res.json({
        jwt:token
    })
})

app.get("/websites",authmiddleware,async(req,res)=>{
    const websites=await prismaClient.website.findMany({
        where:{
            userId:req.userId
        },include:{
            ticks:{
                orderBy:[{
                    createdAt:'desc',
                }],
                take:1
            }
        }

        
    })
    res.json({
        websites
    })
})
app.listen(process.env.PORT || 3001);