const express = require("express");
const router = express.Router();
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const convertToBase64 = require("../utils/converToBase64");

// ========== SIGNUP ==========
router.post("/user/signup", fileUpload(), async (req, res) => {
  try {
    const password = req.body.password;
    const salt = uid2(16);
    const hash = SHA256(password + salt).toString(encBase64);
    const token = uid2(16);

    const { username, email } = req.body;

    //Verification if username is provided
    if (!username) {
      return res.status(400).json({ message: "Username is missing" });
    }

    //Vérification if email doesn't exist

    const checkMail = await User.findOne({ email: email });

    if (checkMail) {
      return res.status(400).json({ message: "Email already used" });
    }

    const newUser = new User({
      email: email,
      account: {
        username: username,
      },
      favorites: {
        characters: [],
        comics: [],
      },
      token: token,
      hash: hash,
      salt: salt,
    });

    //Export avatar to Cloudinary

    if (req.files) {
      const avatarToUpload = req.files.avatar;

      const avatar = await cloudinary.uploader.upload(
        convertToBase64(avatarToUpload),
        {
          public_id: `marvel/avatar/${newUser.id}`,
          overwrite: true,
        }
      );

      newUser.account.avatar = avatar;
    }

    await newUser.save();

    res.status(200).json({
      _id: newUser.id,
      token: newUser.token,
      account: {
        username: newUser.account.username,
        // Voir pour confirmé l'avatar
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== LOGIN ==========

router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const userToSearch = await User.findOne({ email: email });

    if (!userToSearch) {
      return res.status(401).json({ message: "Email or password invalid" });
    }

    const salt = userToSearch.salt;
    const hash = SHA256(password + salt).toString(encBase64);
    const userHash = userToSearch.hash;

    if (hash !== userHash) {
      return res.status(401).json({ message: "Email or password invalid" });
    }

    res.status(200).json({
      _id: userToSearch.id,
      token: userToSearch.token,
      acount: {
        username: userToSearch.account.username,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== ADD/REMOVE CHARACTERS TO FAVOURITES ==========

router.post("/user/favorites/characters/add", async (req, res) => {
  try {
    const userToSearch = await User.findOne({ token: req.body.token });

    const charactersTab = userToSearch.favorites.characters;

    const indexExistant = charactersTab.findIndex(
      (character) => character.id == req.body.id
    );

    if (indexExistant === -1) {
      charactersTab.push({
        id: req.body.id,
        name: req.body.name,
        description: req.body.description,
        img: req.body.img,
      });

      res.status(200).json({
        message: "Favoris ajouté!",
        favoriteCharacters: charactersTab,
      });
    } else {
      charactersTab.splice(indexExistant, 1);
      res.status(200).json({
        message: "Favoris supprimé!",
        favoriteCharacters: charactersTab,
      });
    }

    await userToSearch.save();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// ========== LIST OF FAVORITE CHARACTERS ==========

router.get("/user/favorites/characters", async (req, res) => {
  try {
    const userToSearch = await User.findOne({ token: req.query.token });

    const charactersTab = userToSearch.favorites.characters;

    res.status(200).json({ favoriteCharacters: charactersTab });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// ========== ADD/REMOVE COMICS TO FAVOURITES ==========

router.post("/user/favorites/comics/add", async (req, res) => {
  try {
    console.log("token=", req.body.token);
    const userToSearch = await User.findOne({ token: req.body.token });

    const comicsTab = userToSearch.favorites.comics;

    const indexExistant = comicsTab.findIndex(
      (comic) => comic.id == req.body.id
    );

    if (indexExistant === -1) {
      comicsTab.push({
        id: req.body.id,
        title: req.body.title,
        description: req.body.description,
        img: req.body.img,
      });

      res.status(200).json({
        message: "Favoris ajouté!",
        favoriteComics: comicsTab,
      });
    } else {
      comicsTab.splice(indexExistant, 1);
      res.status(200).json({
        message: "Favoris supprimé!",
        favoriteComics: comicsTab,
      });
    }

    await userToSearch.save();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// ========== LIST OF FAVORITE COMICS ==========

router.get("/user/favorites/comics", async (req, res) => {
  try {
    const userToSearch = await User.findOne({ token: req.query.token });

    const comicsTab = userToSearch.favorites.comics;

    res.status(200).json({ favoriteComics: comicsTab });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
