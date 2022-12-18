export default class ChatsService {
  constructor(dao) {
    this.dao = dao
  }
  getAllChats = () => {
    return this.dao.getAll()
  }
  saveChat = (chat) => {
    return this.dao.save(chat)
  }
}