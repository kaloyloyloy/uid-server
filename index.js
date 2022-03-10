const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");

app.use(express.json());
app.use(cors({credentials: true, origin: true}));

mongoose.connect("mongodb+srv://user:admin@cluster0.hdnus.mongodb.net/userDB")

app.use("/", require("./routes/userRoute"))

app.all("/", (req, res) => {
  res.send("Bot is running!")
})

app.listen(3001, function() {

    console.log("express server is running")
})

