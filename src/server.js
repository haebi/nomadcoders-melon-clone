import express from "express";
import morgan from "morgan";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";
import { localsMiddleware } from "./middlewares";
import rootRouter from "./routers/rootRouter";
import mongoose from "mongoose";

// login
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

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

// song
const songSchema = new mongoose.Schema({
  title: { type: String, unique: true },
  played: Number,
},{versionKey : false});

const Song = mongoose.model('song', songSchema);

// login
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
});

//const User = mongoose.model('User', UserSchema);
// model('User',...) User 이라는 명칭 사용시 오류
// OverwriteModelError: Cannot overwrite `User` model once compiled.
const User = mongoose.model('user', UserSchema);

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
app.get("/insert_sample_song", (req, res) => {
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

// 로그인 처리
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // 입력된 아이디로 사용자 조회
  const user = await User.findOne({ username });

  // 사용자가 존재하지 않으면 에러 반환
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // 입력된 패스워드와 사용자 패스워드를 비교
  const isMatch = await bcrypt.compare(password, user.password);

  // 비밀번호가 일치하지 않으면 에러 반환
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid password' });
  }

  // JWT 토큰 발행
  const token = jwt.sign({ username: user.username }, 'secretkey');

  //test
  console.log(token);
  const decoded = jwt.verify(token, 'secretkey');
  console.log(decoded);

  // JWT 토큰을 클라이언트에게 반환
  res.json({ token });
});

app.get('/song/favorite', async (req, res) => {
  const token = req.headers.authorization;

  //test
  console.log(token);

  // 토큰이 없는 경우, Unauthorized 에러를 반환합니다.
  if (!token) {
    console.log("no token");
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    console.log("a1");
    // JWT 토큰을 검증하고, 토큰에 포함된 정보를 디코딩합니다.
    const decoded = jwt.verify(token, 'secretkey');
    console.log("a2");
    const userId = decoded.userId;
    console.log("a3");

    // 검증된 토큰을 사용하여, 로그인 상태를 확인하고 응답합니다.
    // 이 예시에서는 간단히 "OK" 메시지를 반환합니다.
    return res.status(200).json({ message: 'OK' });
  } catch (error) {
    // 토큰 검증에 실패한 경우, Unauthorized 에러를 반환합니다.
    console.log("invalid token");
    console.log(error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
});

app.get('/insert_sample_user', async (req, res) => {
  //const { username, password } = req.body;
  const username = "demo";
  const password = "1234";

  // 패스워드 암호화
  const hashedPassword = await bcrypt.hash(password, 10);

  // 사용자 생성
  const user = new User({
    username,
    password: hashedPassword,
  });

  await user.save();

  res.json({ message: 'User created' });
});

export default app;
