const express = require("express");
const res = require("express/lib/response");
var cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
const app = express();
app.use(cors());
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
    if (body.type === "CONTACT") {
      options = {
        from: process.env.EMAIL,
        to: body.toemail,
        subject: body.subject,
        template: "contact",
        context: body.context,
      };
    } else if (body.type === "ORDER") {
      options = {
        from: process.env.EMAIL,
        to: [body.toemail, body.context.customerDetails.email],
        subject: body.subject,
        template: "order",
        context: body.context,
      };
    }

    if (options) {
      transporter.sendMail(options, (err, info) => {
        let state = "";
        if (err) {
          console.log(err);
          state = err;
        } else {
          console.log(info.response);
          state = "email sent";
        }

        res.statusMessage = "SENT";
        res.statusCode = 200;
        res.send(state);
      });
    } else {
      res.statusMessage = "ERROR";
      res.statusCode = 500;
      res.send("Error sending email");
    }
  } else {
    res.statusMessage = "TokenError";
    res.statusCode = 500;
    res.send("token no identified");
  }
});
