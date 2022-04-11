const express = require("express");
const app = express();
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: process.env.PROVIDER,
  auth: {
    user: process.env.EMAIL,
    pass: `#${process.env.PASS}`,
  },
});

const PORT = 8080;

app.use(express.json());

app.listen(PORT, () => {});

app.get("/", () => {
  console.log("works");
});

app.post("/sendemail", (req, res) => {
  const { body } = req;
  if (body.token == process.env.EMAILTOKEN) {
    const options = {
      to: body.toemail,
      subject: body.subject,
      text: body.body,
    };

    transporter.sendMail(options, (err, info) => {
      let state = "";
      if (err) {
        console.log(err);
        state = err;
      } else {
        console.log(info.response);
        state = "email sent";
      }
      res.send(state);
    });
  } else {
    res.send("token no identified");
  }
});
