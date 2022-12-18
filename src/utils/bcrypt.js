import bcrypt from 'bcrypt'

export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10)) // Un hasheo no es reversible mientras que cifrado y encriptación sí lo son
export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password)