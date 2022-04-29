const express = require("express");
const res = require("express/lib/response");
const app = express();
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: process.env.PROVIDER,
  auth: {
    user: process.env.EMAIL,
    pass: `${process.env.PASS}`,
    //remember to remove # for heroku
  },
});

const handlebarOptions = {
  viewEngine: {
    extName: ".handlebars",
    partialsDir: path.resolve("./views"),
    defaultLayout: false,
  },
  viewPath: path.resolve("./views"),
  extName: ".handlebars",
};

transporter.use("compile", hbs(handlebarOptions));

let PORT = process.env.PORT || 8080;

app.get("/sendemail", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.send({ msg: "This has CORS enabled 🎈" });
});

app.use(express.json());

app.listen(PORT, () => {});

app.post("/sendemail", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  const { body } = req;
  if (body.token == process.env.EMAILTOKEN) {
    const options = {
      from: process.env.EMAIL,
      to: body.toemail,
      subject: body.subject,
      template: "email",
      context: body.context,
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
