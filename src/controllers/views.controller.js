const login = (req, res) => {
  if (req.session?.user) {
    if (req.session.user.role == 'admin') return res.redirect('/admin')
    return res.redirect('current')
  }
  res.render('login')
}

const register = (req, res) => {
  if (req.session?.user) {
    if (req.session.user.role == 'admin') return res.redirect('/admin')
    return res.redirect('current')
  }
  res.render('register')
}

const current = (req, res) => {
  if (!req.session?.user) return res.redirect('/login')
  if (req.session?.user?.role == 'admin') return res.redirect('admin')
  res.render('current', {user: req.session.user})
}

const admin = (req, res) => {
  if (!req.session?.user) return res.redirect('/login')
  if (req.session?.user?.role != 'admin') return res.redirect('current')
  res.render('admin', {user: req.session.user})
}

export default {
  login,
  register,
  current,
  admin
}