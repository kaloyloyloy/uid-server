const express = require("express")
const router = express.Router();
const User = require("../models/userModel")
const fetch = require("node-fetch-commonjs")
const CryptoJS = require("crypto-js")
const {create} = require("ipfs-http-client")

async function ipfsClient() {
    const ipfs = await create(
        {
            host: "ipfs.infura.io",
            port: 5001,
            gateway: 8080,
            protocol: "https"
        }
    );
    return ipfs;
}

router.route("/encrypt").post(async (req, res) => {
  let ipfs = await ipfsClient();
  try {
    let encryptedCard = CryptoJS.AES.encrypt(JSON.stringify(req.body), process.env['firstSecret']).toString();
    ipfs.add(JSON.stringify(encryptedCard)).then(
    result => {
      let encryptedIpfs = CryptoJS.AES.encrypt(result.path, process.env['secondSecret']).toString();
      res.send(encryptedIpfs);
    }
  )
  } catch (error) {
    console.log(error)
  }
  

  
  
})

router.route("/decrypt").post((req, res) => {
  console.log(req.body.encrypted)
  let encryptedIpfs = req.body.encrypted
  let bytes = CryptoJS.AES.decrypt(encryptedIpfs, process.env['secondSecret'])
  let decryptedIpfs = bytes.toString(CryptoJS.enc.Utf8);
  fetch(`https://ipfs.infura.io/ipfs/${decryptedIpfs}`)
    .then((response) => response.json())
    .then((encryptedCard) => {
      let decryptedCard = CryptoJS.AES.decrypt(encryptedCard, process.env['firstSecret']).toString(CryptoJS.enc.Utf8);
      let card = JSON.parse(decryptedCard)
      res.send(card)
    })

})
router.route("/register").post((req, res) => {
  const user = req.body.user;
  const password = req.body.password;
  const address = req.body.address;
  const newUser = new User({
    user,
    password,
    address
  });

  newUser.save();
  res.send('Registration Succesful!');
})

router.route("/login").post((req, res) => {
  const user = req.body.user;
  const password = req.body.password;
  const address = req.body.address;
  User.findOne({ user: { $eq: user } }).then(foundUser => {
    if (!foundUser || foundUser.password != password) res.send('Incorrect Username or Password.')
    if (foundUser.address != address) res.send('Metamask address mismatch!')
    res.send('Login Successful!')
    })
})

module.exports = router;