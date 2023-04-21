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
import bcrypt from "bcrypt";

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

// songs
const songSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    title: String,
    author: String,
    played: Number,
  },
  { versionKey: false }
);

const Song = mongoose.model("song", songSchema);

// // favorites
// const favoriteSchema = new mongoose.Schema(
//   {
//     user: { type: String },
//     id: { type: String },
//     title: String,
//     author: String,
//   },
//   { versionKey: false }
// );

// // user와 id 필드를 unique index로 지정
// favoriteSchema.index({ user: 1, id: 1 }, { unique: true });
// const Favorite = mongoose.model("favorite", favoriteSchema);

// favorites
// user와 id 필드를 unique index로 지정 했는데... 중복으로 데이터가 들어가져서 실패...
const favoriteSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true },
    user: String,
    id: String,
    title: String,
    author: String,
  },
  { versionKey: false }
);

// user와 id 필드를 unique index로 지정
const Favorite = mongoose.model("favorite", favoriteSchema);

// users
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
});

const User = mongoose.model("user", UserSchema);

app.get("/top10", (req, res) => {
  Song.find({})
    .sort({ played: -1 })
    .limit(10)
    .exec((err, songs) => {
      if (err) {
        console.error(err);
        res.send(err);
      } else {
        //console.log('Top 10 played songs:', songs);
        const jsonSongs = JSON.stringify(songs);
        console.log(jsonSongs);
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Content-Type", "application/json");
        res.send(jsonSongs);
      }
    });
});

// sample data insert
app.get("/insert_sample_song", (req, res) => {
  const sampleList = [
    {
      id: "HaEYUJ2aRHs",
      title: "Dynamite",
      author: "BTS",
      played: 22,
    },
    {
      id: "NT8ePWlgx_Y",
      title: "FAKE LOVE",
      author: "BTS",
      played: 33,
    },
    {
      id: "NNCBq0JHXsU",
      title: "Butter",
      author: "BTS",
      played: 11,
    },
  ];

  for (let i = 0; i < sampleList.length; i++) {
    // 새로운 데이터 저장
    const newSong = new Song({
      id: sampleList[i].id,
      title: sampleList[i].title,
      author: sampleList[i].author,
      played: sampleList[i].played,
    });

    newSong.save((err, savedSong) => {
      if (err) {
        console.error(err);
      } else {
        console.log("Saved song:", savedSong);
      }
    });
  }

  res.send("sample data stored.");
});

// 로그인 처리
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // 입력된 아이디로 사용자 조회
  const user = await User.findOne({ username });

  // 사용자가 존재하지 않으면 에러 반환
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // 입력된 패스워드와 사용자 패스워드를 비교
  const isMatch = await bcrypt.compare(password, user.password);

  // 비밀번호가 일치하지 않으면 에러 반환
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid password" });
  }

  // JWT 토큰 발행
  const token = jwt.sign({ username: user.username }, "secretkey");

  //test
  console.log(token);
  const decoded = jwt.verify(token, "secretkey");
  console.log(decoded);

  // JWT 토큰을 클라이언트에게 반환
  res.json({ token });
});

app.get("/song/favorite", async (req, res) => {
  const token = req.headers.authorization;

  //test
  console.log(token);

  // 토큰이 없는 경우, Unauthorized 에러를 반환합니다.
  if (!token) {
    console.log("no token");
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // JWT 토큰을 검증하고, 토큰에 포함된 정보를 디코딩합니다.
    const decoded = jwt.verify(token, "secretkey");
    const userId = decoded.userId;

    Favorite.find({}).exec((err, songs) => {
      if (err) {
        console.error(err);
        res.send(err);
      } else {
        //console.log('Top 10 played songs:', songs);
        const jsonFavorites = JSON.stringify(songs);
        console.log(jsonFavorites);
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Content-Type", "application/json");
        res.send(jsonFavorites);
      }
    });

    //return res.status(200).json({ message: "OK" });
  } catch (error) {
    // 토큰 검증에 실패한 경우, Unauthorized 에러를 반환합니다.
    console.log("invalid token");
    console.log(error);
    return res.status(401).json({ message: "Unauthorized" });
  }
});

// 즐겨찾기 추가
app.post("/song/favorite/add", async (req, res) => {
  const { id, username } = req.body;
  const token = req.headers.authorization;
  console.log("XXX:" + token);

  // 토큰이 없는 경우, Unauthorized 에러를 반환합니다.
  if (!token) {
    console.log("no token");
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!id) {
    return res.status(404).json({ message: "Invalid request" });
  }

  try {
    // JWT 토큰을 검증하고, 토큰에 포함된 정보를 디코딩합니다.
    const decoded = jwt.verify(token, "secretkey");
    //const user = decoded.userId;

    const song = await Song.findOne({ id: id });
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    console.log(`DEBUG[/song/favorite/add]: ${username} / ${id}`);

    const newFavorite = new Favorite({
      key: username + id,
      user: username,
      id: id,
      title: song.title,
      author: song.author,
    });

    await newFavorite.save();

    return res.status(200).json({ message: "OK" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to add favorite" });
  }
});

// 즐겨찾기 추가
app.post("/song/favorite/del", async (req, res) => {
  const { id, username } = req.body;
  const token = req.headers.authorization;
  console.log("XXX:" + token);

  // 토큰이 없는 경우, Unauthorized 에러를 반환합니다.
  if (!token) {
    console.log("no token");
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!id) {
    return res.status(404).json({ message: "Invalid request" });
  }

  try {
    // JWT 토큰을 검증하고, 토큰에 포함된 정보를 디코딩합니다.
    const decoded = jwt.verify(token, "secretkey");
    //const user = decoded.userId;
    const key = username + id;
    const result = await Favorite.deleteOne({ key });
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: `Favorite with key ${key} not found` });
    }
    return res.json({ message: `Favorite with key ${key} deleted` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/insert_sample_user", async (req, res) => {
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

  res.json({ message: "User created" });
});

app.get("/song/played/:id", async (req, res) => {
  try {
    const songId = req.params.id;
    const song = await Song.findOneAndUpdate(
      { id: songId },
      { $inc: { played: 1 } },
      { new: true }
    );
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }
    return res.json(song);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/song/played/reset", async (req, res) => {
  try {
    const result = await Song.updateMany({}, { played: 0 });
    return res.json({
      message: `Played counts reset for ${result.nModified} songs`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default app;
