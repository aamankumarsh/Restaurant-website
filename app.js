require("dotenv").config();

const express = require("express");

const app = express();

const mysql = require("mysql");

const nodemailer = require("nodemailer");

const bodyParser = require("body-parser");

const md5 = require("md5");
const { getMaxListeners } = require("process");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "aman.jsr64@gmail.com",//"youremail@gmail.com", // you have to write your email here
    pass: process.env.SECRET, // you have to write your password in .env file
  },
});
let fname;

let lname;

let email;

let password;

const randomNum = Math.floor(Math.random() * 100);

let week = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

let month = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

let date_ob = new Date();

let curDate;

let curDay;

let curMon;

let curYear;

let curMin;

let dummy = "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz";

curDay = week[date_ob.getDay()];

curMon = month[date_ob.getMonth()];

curDate = date_ob.getDate();

curYear = date_ob.getFullYear();

console.log(curDate, curDay, curMon, curYear);

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname));

app.set("view engine", "ejs");

// this is your mysql details
const connection = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Swaraj@12345",
  database: "FINAL",
});

app.get("/", function (req, res) {
  res.render("index");
});
app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/password", function (req, res) {
  res.render("password");
});
app.get("/home", function (req, res) {
  res.render("home", { fname: fname, lname: lname });
});
app.get("/menu", function (req, res) {
  res.render("menu");
});
app.get("/contact_thanks", function (req, res) {
  res.render("contact_thanks", { fname: fname, lname: lname });
});
app.get("/update_thanks", function (req, res) {
  res.render("update_thanks", { fname: fname, lname: lname });
});
app.get("/contact", function (req, res) {
  console.log(fname);
  res.render("contact", { fname: fname, lname: lname, email: email });
});
app.get("/update_profile", function (req, res) {
  console.log(fname);
  res.render("update_profile", { fname: fname, lname: lname, email: email });
});
app.post("/password", function (req, res) {
  email = req.body.email;
  let sql0 = `select * from one where email='${email}' or email='${dummy}' order by email`;
  connection.query(sql0, function (err, rows, field) {
    if (!err) {
      if (email === rows[0].Email) {
        fname = rows[0].FirstName;
        lname = rows[0].LastName;
        console.log(fname, lname);
        const mailOptions = {
          from: "rajatdh49@gmail.com",
          to: `${email}`,
          subject: "Forgotten Password",
          html: `<p style="text-align: center; font-size: 1.5rem">Hi! ${fname} ${lname} 😊</p>
          <p style="text-align: center; font-size: 1rem">
            We have recieved your request to reset your password
          </p>
          <p style="text-align: center; font-size: 1rem">Your Verification Code: ${randomNum}</p>`,
        };
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
            res.render("reset");
          }
        });
      } else {
        res.render("not_signed_up");
      }
    }
  });
});
app.post("/reset", function (req, res) {
  const code = Number(req.body.code);
  console.log(code, randomNum, "hiihoihsaooh");
  if (code === randomNum) {
    console.log("Done");
    res.render("newpass");
  } else {
    res.render("already_registered");
  }
});
app.post("/newpass", function (req, res) {
  password = md5(req.body.password);
  let sql05 = `update one set Password='${password}' where Email='${email}'`;
  connection.query(sql05, function (err) {
    if (!err) {
      res.redirect("/update_thanks");
    }
  });
});
app.post("/", function (req, res) {
  email = req.body.email;
  fname = req.body.fname;
  lname = req.body.lname;
  password = md5(req.body.password);
  let sql1 = `insert into one(FirstName,LastName,Email,Password) values('${fname}','${lname}','${email}','${password}')`;
  let sql2 = `select * from one where email='${email}' or email='${dummy}' order by email`;
  connection.query(sql2, function (err, rows, field) {
    if (!err) {
      if (dummy === rows[0].Email) {
        connection.getConnection(function (err) {
          if (err) {
            throw err;
          } else {
            connection.query(sql1, function (err) {
              if (err) {
                throw err;
              } else {
                console.log(req.body);
                res.redirect("home");
              }
            });
          }
        });
      } else {
        res.render("already_registered");
      }
    }
  });
});
app.post("/login", function (req, res) {
  email = req.body.email;
  password = md5(req.body.password);
  let sql4 = `select * from one where email='${email}' or email='${dummy}' order by email`;
  connection.getConnection(function (err) {
    if (err) {
      throw err;
    } else {
      connection.query(sql4, function (err, rows, field) {
        if (!err) {
          if (email === rows[0].Email) {
            if (password === rows[0].Password) {
              fname = rows[0].FirstName;
              lname = rows[0].LastName;
              res.redirect("home");
            } else {
              res.render("wrong_password");
            }
          } else {
            res.render("not_signed_up");
          }
        }
      });
    }
  });
});
app.post("/contact", function (req, res) {
  email = req.body.email;
  fname = req.body.firstName;
  lname = req.body.lastname;
  const review = req.body.review;
  const service = req.body.service;
  let sql4 = `insert into formData(FirstName,LastName,Email,Review,Satisfied,Day,Date,Month,Year) values("${fname}","${lname}","${email}","${review}","${service}","${curDay}","${curDate}","${curMon}","${curYear}")`;
  connection.query(sql4, function (err) {
    if (err) {
      throw err;
    } else {
      console.log(`Data Has Been Stored`);
      res.redirect("/contact_thanks");
    }
  });
});

app.post("/update_profile", function (req, res) {
  fname = req.body.fname;
  lname = req.body.lname;
  password = md5(req.body.password);
  let sql5 = `update one set FirstName='${fname}', LastName='${lname}', Password='${password}' where Email='${email}'`;
  console.log(req.body);
  connection.getConnection(function (err) {
    if (err) {
      throw err;
    } else {
      connection.query(sql5, function (err) {
        if (!err) {
          res.redirect("/update_thanks");
        }
      });
    }
  });
});

app.post("/account_deleted", function (req, res) {
  fname = req.body.fname;
  lname = req.body.lname;
  console.log(email, "hello");
  let sql5 = `delete from one where Email='${email}'`;
  console.log(req.body);
  connection.getConnection(function (err) {
    if (err) {
      throw err;
    } else {
      connection.query(sql5, function (err) {
        if (!err) {
          res.render("account_deleted");
        }
      });
    }
  });
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Sever Listening At Port 3000");
});

// create table formData
// (
// User_No int primary key auto_increment,
// FirstName varchar(20),
// LastName varchar(20),
// Email varchar(100),
// Review varchar(256),
// Satisfied varchar(256),
// Day varchar(20),
// Date varchar(20),
// Month varchar(20),
// Year varchar(20)
// );

// create table one
// (
// User_No int primary key auto_increment,
// FirstName varchar(20),
// LastName varchar(20),
// Email varchar(100),
// Password varchar(100)
// );
