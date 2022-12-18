export default class UsersService {
  constructor(dao) {
    this.dao = dao
  }
  getUserById = (id) => {
    return this.dao.getById(id)
  }
  getUserByEmail = (email) => {
    return this.dao.getByEmail(email)
  }
  saveUser = (user) => {
    return this.dao.save(user)
  }
}