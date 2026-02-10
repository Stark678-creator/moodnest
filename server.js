import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const USERS_FILE = "./users.json";

const readUsers = () => JSON.parse(fs.readFileSync(USERS_FILE));
const saveUsers = (u) => fs.writeFileSync(USERS_FILE, JSON.stringify(u,null,2));

app.post("/signup",(req,res)=>{
  const {name,age,email,password} = req.body;
  if(!name||!age||!email||!password) return res.json({error:"All fields required"});
  const users = readUsers();
  if(users.find(u=>u.email===email)) return res.json({error:"User exists"});
  users.push({
    id:Date.now(),
    name,age,email,
    password:bcrypt.hashSync(password,10),
    tokens:100
  });
  saveUsers(users);
  res.json({success:true});
});

app.post("/login",(req,res)=>{
  const {email,password} = req.body;
  const user = readUsers().find(u=>u.email===email);
  if(!user || !bcrypt.compareSync(password,user.password))
    return res.json({error:"Invalid login"});
  const token = jwt.sign({id:user.id},process.env.JWT_SECRET);
  res.json({token,name:user.name,tokens:user.tokens});
});

app.post("/chat",(req,res)=>{
  const {token,message} = req.body;
  const decoded = jwt.verify(token,process.env.JWT_SECRET);
  const users = readUsers();
  const user = users.find(u=>u.id===decoded.id);
  if(!user || user.tokens<=0) return res.json({reply:"No tokens left"});

  user.tokens -= 5;
  saveUsers(users);

  fetch("https://api.openai.com/v1/chat/completions",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":`Bearer ${process.env.OPENAI_API_KEY}`
    },
    body:JSON.stringify({
      model:"gpt-3.5-turbo",
      messages:[
        {role:"system",content:"You are calm, helpful, concise."},
        {role:"user",content:message}
      ],
      max_tokens:200
    })
  }).then(r=>r.json()).then(d=>{
    res.json({reply:d.choices[0].message.content,tokens:user.tokens});
  });
});

app.listen(3000,()=>console.log("Backend running on port 3000"));
