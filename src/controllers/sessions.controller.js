import sendMail from '../utils/mailService.js'
import config from '../config/config.js'
import { UsersDTOPresenter, UsersDTOPresenterGithub } from '../dto/users.dto.js'

const register = async(req, res) => {
  await sendMail(
    'Beer Store Register Logs',
    config.gmailService.MAIL_TO,
    'New registration at the Beer Store',
    `
      <div>
        <h2>New account has just been created at the Beer Store</h2>
        <p>Account Details:</p>
        <img style="width: 50px; border: solid 3px #ccc; border-radius: 50%;" src="cid:avatar">
        <ul>
          <li>Name: ${req.user.name}</li>
          <li>Email: ${req.user.email}</li>
          <li>Password: ${req.user.password}</li>
          <li>Address: ${req.user.address}</li>
          <li>Age: ${req.user.age}</li>
          <li>Phone: ${req.user.phone}</li>
          <li>Phone: ${req.user.role}</li>
          <li>Cart ID: ${req.user.cart}</li>
        </ul>
      </div>
    `,
    [
      {
        filename: `${req.user.avatar}.jpg`,
        path: `./src/public/images/${req.user.avatar}`,
        cid: 'avatar'
      }
    ]
  )
  res.send({status:"success", payload: req.user})
}

const registerfail = (req, res) => {
  res.status(500).send({status: 'error', message: 'Error ocurred while registering a user'})
}

const login = (req, res) => {
  req.session.user = new UsersDTOPresenter(req.user)
  if (req.user.role == 'admin') {
    res.redirect('/admin')
  } else {
    res.redirect('/current')
  }
}

const loginfail = (req, res) => {
  res.status(500).send({status: 'error', message: 'Error in login'})
}

const githubCallback = (req, res) => {
  req.session.user = new UsersDTOPresenterGithub(req.user)
  res.redirect('/current')
}

const logout = (req, res) => {
  req.session.destroy(error => {
    if (error) return res.status(500).send({status: 'error', message: 'Could not logout, please try again'})
  })
  res.redirect('/login')
}

export default {
  register,
  registerfail,
  login,
  loginfail,
  githubCallback,
  logout
}