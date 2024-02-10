const express = require("express");
const router = express.Router();
const axios = require("axios");
const itemPerPage = 100;

//FOR ALL COMICS
router.get("/comics", async (req, res) => {
  try {
    console.log("search=", req.query.search);
    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/comics?apiKey=${
        process.env.MARVEL_API_KEY
      }&title=${req.query.search}&skip=${itemPerPage * (req.query.page - 1)}`
    );

    console.log("response.data=", response.data);

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//FOR COMICS WITH A SPECIFIC CHARACTER
router.get("/comics/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/comics/${id}?apiKey=nyf7sM2eHOylbu34`
    );

    console.log("response.data=", response.data);

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
