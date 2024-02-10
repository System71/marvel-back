const express = require("express");
const router = express.Router();
const axios = require("axios");
const itemPerPage = 100;

//FOR ALL CHARACTERS
router.get("/characters", async (req, res) => {
  try {
    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/characters?apiKey=nyf7sM2eHOylbu34&name=${
        req.query.search
      }&skip=${itemPerPage * (req.query.page - 1)}`
    );
    console.log("response.data=", response.data);

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//FOR SPECIFIC CHARACTER
router.get("/characters/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/character/${id}?apiKey=nyf7sM2eHOylbu34`
    );

    console.log("response.data=", response.data);

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
