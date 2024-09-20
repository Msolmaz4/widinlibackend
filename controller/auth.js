"use strict";

const User = require("../model/user");

/* -------------------------------------------------------------------------- */
module.exports = {
  register: async (req, res) => {
    try {
      console.log(req.body)

      const emailControl = await User.findOne({ email: req.body.email });
      if (emailControl)
        return res.status(404).send({
          message: "email control",
        });
      const user = new User({
        userType: req.body.userType,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
      });

      // Veriyi MongoDB'ye kaydediyoruz.
      const data = await user.save();

      res.send({
        data,
        success: true,
        message: "User created successfully",
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
        der: "taxidsilindi",
      });
    }
  },
  //! POST
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log(email, password);

      if (email && password) {
        const user = await User.findOne({ email });
        console.log(user);

        if (user) {
          res.status(200).send({
            error: false,
            user,
          });
          //* -------------------------------------------------------------------------- */
        } else {
         res.status(401).send({
          error:true
         })
        }
      }
    } catch (error) {
      res.status(401).send({
        error:true
       })
    }
  },
  forgot: async (req, res) => {
    /*
        #swagger.tags = ['Forgot']
        #swagger.summary = 'email'
        #swagger.description = 'acces'
        #swagger.parameters['body'] = {
            in: 'body',
            required: true,
            schema: {
               "email":"..........@gmail.com"
            }
        }
    */
    //console.log(req.body, "forgot");
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      //console.log(user, "forgot");
      if (!user) {
        res.status(401).send({
          message: "No such user found, try again",
        });
      }
      const token = await jwt.sign({ id: user._id }, process.env.REFRESH_KEY, {
        expiresIn: "1h",
      });
      //console.log(token, "tokenforgot");

      if (token) {
        sendMail(
          email,
          "reset password",
          `<h1> Şifrenizi sıfırlamak için aşağıdaki bağlantıyı kullanın: http://localhost:5173/reset/${token}</h1>`
        );
        res.send({
          message: "password reser mailil",
          error: false,
        });
      }
    } catch (error) {
      res.send("reset false");
    }
  },
  reset: async (req, res) => {
    /*
        #swagger.tags = ['Reset']
        #swagger.summary = ''
        #swagger.description = 'Email with AcceshToken'
        #swagger.parameters['body'] = {
            in: 'body',
            required: true,
            schema: {
                bearer: {
                    refresh: '...AccessToken...'
                }
            }
        }
    */
    try {
      const { token, password } = req.body;

      console.log(token, password);
      const decod = await jwt.verify(token, process.env.REFRESH_KEY);
      console.log("Decoded Token:", decod);
      const userId = decod.id;
      const user = await User.findById(userId);

      if (user) {
        user.password = bcrypt.hashSync(password, 10);
        await user.save();
        res.status(200).json({ message: "Password reset successful" });
      } else {
        res.send({
          message: "user bulunamadi",
        });
      }
    } catch (error) {
      res.send({
        message: "reset problem",
      });
    }
  },

  gofatel: async (req, res) => {
    const { google, facebook, telefon } = req.body;
    //console.log(req.body)

    try {
      if (google && !facebook && !telefon) {
        console.log(google?.email, "google");
        const user = await User.findOne({ email: google.email });

        if (user) {
          res.send({
            error: false,
            message: "User found",
            data: user,
          });
        } else if (!user) {
          const isValidObjectId = ObjectId.isValid(google.uid);

          let userId;
          if (isValidObjectId) {
            console.log("Verilen değer zaten bir ObjectID.");
            userId = new ObjectId(google.uid); // Zaten bir ObjectID ise doğrudan kullanabiliriz
          } else {
            console.log("Verilen değer bir ObjectID değil, dönüştürülüyor...");
            userId = new ObjectId(); // Yeni bir ObjectID oluşturabiliriz
            console.log(userId, "gumledi");
          }
          console.log(userId);

          const user = new User({
            _id: userId,
            name: google.displayName,
            email: google.email,
            username: google.displayName,
            password: passwordEncrypt(google.displayName),
          });

          // Veriyi MongoDB'ye kaydediyoruz.
          const data = await user.save();
          res.send({
            data,
            success: true,
            message: "User created successfully",
          });
        } else {
          res.status(400).send({
            success: false,
            message: "user dont find",
          });
        }
      } else {
        res.send({
          succes: "false",
        });
      }
    } catch (error) {
      console.log(error);
    }
  },

  //! POST
  refresh: async (req, res) => {
    /*
        #swagger.tags = ['Authentication']
        #swagger.summary = 'JWT: Refresh'
        #swagger.description = 'Refresh accessToken with refreshToken'
        #swagger.parameters['body'] = {
            in: 'body',
            required: true,
            schema: {
                bearer: {
                    refresh: '...refreshToken...'
                }
            }
        }
    */

    const refreshToken = req.body?.bearer?.refresh;

    if (refreshToken) {
      const jwtData = await jwt.verify(refreshToken, process.env.REFRESH_KEY);

      if (jwtData) {
        const { id, password } = jwtData;

        if (id && password) {
          const user = await User.findOne({ _id: id });

          if (user && user.password == password) {
            if (user.isActive) {
              // JWT AccessToken:
              const accessToken = jwt.sign(
                user.toJSON(),
                process.env.ACCESS_KEY,
                { expiresIn: "9m" } //dokuy dakia
              );

              res.status(200).send({
                error: false,
                bearer: {
                  access: accessToken,
                },
              });
            } else {
              res.errorStatusCode = 401;
              throw new Error("This account is not active.");
            }
          } else {
            res.errorStatusCode = 401;
            throw new Error("Wrong id or password.");
          }
        } else {
          res.errorStatusCode = 401;
          throw new Error("There is not id and password in refreshToken.");
        }
      } else {
        res.errorStatusCode = 401;
        throw new Error("JWT accessToken expires.");
      }
    } else {
      res.errorStatusCode = 401;
      throw new Error("Please enter token.refresh");
    }
  },

  //! GET
  logout: async (req, res) => {
    /*
        #swagger.tags = ["Authentication"]
        #swagger.summary = "SimpleToken: Logout"
        #swagger.description = 'Delete token key.'
    */

    const auth = req.headers?.authorization || null;
    const tokenKey = auth ? auth.split(" ") : null;
    const tokenData = await Token.deleteOne({ token: tokenKey[1] });

    res.send({
      error: false,
      message: "Logged Out",
      data: tokenData,
    });
  },
};
