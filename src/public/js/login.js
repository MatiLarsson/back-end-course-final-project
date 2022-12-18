// Login logic
const loginForm = document.getElementById('loginForm')
loginForm.addEventListener('submit', e => {
  e.preventDefault()
  let data = new FormData(loginForm)
  let obj = {}
  data.forEach((value, key) => obj[key] = value)
  fetch('api/sessions/login', {
    method: 'POST',
    body: JSON.stringify(obj),
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then((res) => {
    if (res.status == 200) {
      window.location.href = '/'
    }
  })
  .catch(error => console.log(error))
})