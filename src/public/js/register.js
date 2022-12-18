// Register logic
const registerForm = document.getElementById('registerForm')
registerForm.addEventListener('submit', e => {
  e.preventDefault()
  const password1 = document.querySelector('#password').value
  const password2 = document.querySelector('#password-verification').value
  if (password1 != password2) {
    Swal.fire({
      icon: 'error',
      text: "Passwords entered do not match",
      toast: true,
      position: "top-right",
      timer: 2000
    })
    return
  }
  const age = document.querySelector('#age').value
  if (age < 18) {
    Swal.fire({
      icon: 'error',
      text: "You must be 18+ years old to register in this store!",
      toast: true,
      position: "top-right",
      timer: 2000
    })
    return
  }
  let data = new FormData(registerForm)
  let obj = {}
  data.forEach((value, key) => obj[key] = value)
  if (document.querySelector('#adminCheckbox').checked) {
    obj = {...obj, role: 'admin'}
  } else {
    obj = {...obj, role: 'user'}
  }
  const selectedAvatar = document.querySelector('.selected-avatar')
  if (selectedAvatar) {
    obj = { ...obj, avatar: `${selectedAvatar.id}.jpg`}
  } else {
    obj = { ...obj, avatar: 'avatar1.jpg'}
  }
  fetch('api/sessions/register', {
    method: 'POST',
    body: JSON.stringify(obj),
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then(res => res.json())
  .then(json => {
    if (json.status == 'success') {
      Swal.fire({
        icon: 'success',
        text: `Congratulations ${json.payload.name}! You have succesfully registered!`,
        toast: true,
        position: "top-right",
        timer: 2000
      })
      window.setTimeout(() => window.location.href = '/', 2000)
    }
  })
  .catch(error => console.log(error))
})


const avatars = document.querySelectorAll('.avatar')

avatars.forEach(avatar => avatar.addEventListener('click', () => {
  avatars.forEach(element => element.className = 'avatar')
  avatar.className = 'avatar selected-avatar'
}))

