import express from "express";
import morgan from "morgan";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";
import { localsMiddleware } from "./middlewares";
import rootRouter from "./routers/rootRouter";
import mongoose from "mongoose";

const app = express();
const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(logger);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  })
);
app.use(flash());
app.use(localsMiddleware);
app.use("/uploads", express.static("uploads"));
//app.use("/static", express.static("assets"));
app.use("/static", express.static(__dirname + "/client"));

app.use("/", rootRouter);
/*
Add more routers here!
*/

// MongoDB 연결
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const songSchema = new mongoose.Schema({
  title: { type: String, unique: true },
  played: Number,
},{versionKey : false});

const Song = mongoose.model('song', songSchema);

app.get("/top10", (req, res) => {
  Song.find({}).sort({ played: -1 }).limit(10).exec((err, songs) => {
    if (err) {
      console.error(err);
      res.send(err);
    } else {
      //console.log('Top 10 played songs:', songs);
      const jsonSongs = JSON.stringify(songs);
      console.log(jsonSongs);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Content-Type', 'application/json');
      res.send(jsonSongs);
    }
  });
});

// sample data insert
app.get("/insert_sample", (req, res) => {
  // 새로운 모델 생성
  // const songSchema = new mongoose.Schema({
  //   title: { type: String, unique: true },
  //   played: Number,
  // },{versionKey : false});

  // const Song = mongoose.model('song', songSchema);

  const sampleList = [
    {
      title: 'FAKE LOVE - BTS',
      played: 44,
    },
    {
      title: '달려라 방탄 - BTS',
      played: 22,
    },
    {
      title: 'Permission to Dance - BTS',
      played: 33,
    },
    {
      title: 'Butter - BTS',
      played: 11,
    },
    {
      title: 'Dynamite - BTS',
      played: 55,
    },
  ];

  for (let i = 0; i < sampleList.length; i++) {
    // 새로운 데이터 저장
    const newSong = new Song({
      title: sampleList[i].title,
      played: sampleList[i].played,
    });

    newSong.save((err, savedSong) => {
      if (err) {
        console.error(err);
      } else {
        console.log('Saved song:', savedSong);
      }
    });
  }

  res.send('sample data stored.');
});

export default app;
